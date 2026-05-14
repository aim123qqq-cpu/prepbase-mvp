const fs = require("fs");
const https = require("https");

const SOURCES = [
  "https://t.me/saba_hunter",
  "https://t.me/analysts_hunter",
  "https://t.me/analyst_job",
  "https://t.me/tzprofi_job"
];

const VACANCY_MARKERS = [
  /ваканс/i,
  /ищем/i,
  /требуется/i,
  /нужен|нужна|нужны/i,
  /отклик/i,
  /резюме/i,
  /зарплат|зп/i,
  /remote|удален/i,
  /junior|middle|senior|lead/i,
  /аналитик|analyst/i
];

const SKILLS = [
  ["SQL", [/\bsql\b/i, /postgres/i, /mysql/i, /oracle/i, /mssql/i, /ms sql/i]],
  ["Python", [/\bpython\b/i]],
  ["Excel", [/\bexcel\b/i, /эксель/i]],
  ["Power BI", [/\bpower\s*bi\b/i, /\bpbi\b/i]],
  ["Tableau", [/\btableau\b/i]],
  ["BI", [/\bbi\b/i, /business intelligence/i]],
  ["DWH", [/\bdwh\b/i, /data warehouse/i, /хранилищ[ае] данных/i]],
  ["ETL", [/\betl\b/i, /elt/i]],
  ["REST API", [/\brest\b/i, /rest api/i, /\bapi\b/i]],
  ["SOAP", [/\bsoap\b/i]],
  ["GraphQL", [/\bgraphql\b/i]],
  ["JSON", [/\bjson\b/i]],
  ["XML", [/\bxml\b/i]],
  ["Postman", [/\bpostman\b/i]],
  ["Swagger / OpenAPI", [/\bswagger\b/i, /openapi/i, /open api/i]],
  ["Kafka", [/\bkafka\b/i]],
  ["RabbitMQ", [/\brabbit\s*mq\b/i]],
  ["BPMN", [/\bbpmn\b/i]],
  ["UML", [/\buml\b/i]],
  ["Use Case", [/use case/i, /юзкейс/i, /сценари[йи] использования/i]],
  ["User Story", [/user stor/i, /пользовательск(ая|ие) истор/i]],
  ["Acceptance Criteria", [/acceptance criteria/i, /критери[ий] прием/i]],
  ["ТЗ", [/\bтз\b/i, /техническ(ое|ого) задани/i]],
  ["BRD / FRD", [/\bbrd\b/i, /\bfrd\b/i]],
  ["Jira", [/\bjira\b/i, /джир/i]],
  ["Confluence", [/\bconfluence\b/i]],
  ["Miro", [/\bmiro\b/i]],
  ["Figma", [/\bfigma\b/i]],
  ["Agile", [/\bagile\b/i, /аджайл/i]],
  ["Scrum", [/\bscrum\b/i]],
  ["Kanban", [/\bkanban\b/i]],
  ["Git", [/\bgit\b/i, /gitlab/i, /github/i]],
  ["Docker", [/\bdocker\b/i]],
  ["Kubernetes", [/\bkubernetes\b/i, /\bk8s\b/i]],
  ["MongoDB", [/\bmongo\s*db\b/i, /\bmongodb\b/i]],
  ["Redis", [/\bredis\b/i]],
  ["ClickHouse", [/\bclickhouse\b/i]],
  ["Airflow", [/\bairflow\b/i]],
  ["Spark", [/\bspark\b/i]],
  ["Hadoop", [/\bhadoop\b/i]],
  ["CRM", [/\bcrm\b/i, /црм/i]],
  ["ERP", [/\berp\b/i]],
  ["SAP", [/\bsap\b/i]],
  ["1C", [/\b1c\b/i, /\b1с\b/i, /1с:/i, /1c:/i]],
  ["Системный анализ", [/системн(ый|ого) аналит/i, /system analyst/i]],
  ["Бизнес-анализ", [/бизнес-?аналит/i, /business analyst/i]],
  ["Сбор требований", [/сбор требований/i, /выявлени[ея] требований/i, /requirements/i]],
  ["Моделирование процессов", [/моделировани[ея] процесс/i, /описани[ея] процесс/i]],
  ["Интеграции", [/интеграц/i, /integration/i]],
  ["CustDev", [/custdev/i, /customer development/i, /интервью с пользов/i]],
  ["CJM", [/\bcjm\b/i, /customer journey/i]]
];

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const stats = {
    updatedAt: new Date().toISOString(),
    sources: SOURCES,
    totalMessages: 0,
    totalVacancies: 0,
    skills: [],
    errors: []
  };

  const skillMap = new Map(SKILLS.map(([name]) => [name, { name, count: 0, sources: {} }]));

  for (const source of SOURCES) {
    try {
      const html = await fetchText(toTelegramArchiveUrl(source));
      const messages = extractMessages(html);
      stats.totalMessages += messages.length;

      for (const message of messages) {
        const text = normalizeText(message.text);
        if (!isVacancy(text)) continue;

        stats.totalVacancies += 1;
        const matched = findSkills(text);

        for (const skillName of matched) {
          const item = skillMap.get(skillName);
          item.count += 1;
          item.sources[source] = (item.sources[source] || 0) + 1;
        }
      }
    } catch (error) {
      stats.errors.push({ source, message: error.message });
    }
  }

  stats.skills = [...skillMap.values()]
    .filter((skill) => skill.count > 0)
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, "ru"))
    .map((skill) => ({
      name: skill.name,
      count: skill.count,
      sources: skill.sources
    }));

  const payload = `window.PREPBASE_SKILL_STATS = ${JSON.stringify(stats, null, 2)};\n`;
  fs.writeFileSync("skills-stats.js", payload, "utf8");
  console.log(`Parsed ${stats.totalVacancies} vacancies and ${stats.skills.length} skills.`);
}

function toTelegramArchiveUrl(source) {
  const url = new URL(source);
  const channel = url.pathname.replace(/^\/+/, "");
  return `https://t.me/s/${channel}`;
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 PrepbaseBot/1.0",
          "Accept-Language": "ru,en;q=0.9"
        },
        timeout: 20000
      },
      (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          resolve(fetchText(new URL(response.headers.location, url).toString()));
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          response.resume();
          return;
        }

        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => resolve(body));
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error("Request timeout"));
    });
    request.on("error", reject);
  });
}

function extractMessages(html) {
  const blocks = html.match(/<div class="tgme_widget_message_wrap[\s\S]*?(?=<div class="tgme_widget_message_wrap|<section class="tgme_channel_history|$)/g) || [];

  return blocks.map((block) => {
    const textBlock = block.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    return {
      text: decodeHtml(stripTags(textBlock ? textBlock[1] : block))
    };
  });
}

function stripTags(value) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>|<\/div>|<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
}

function decodeHtml(value) {
  const entities = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: "\"",
    apos: "'",
    nbsp: " "
  };

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === "#") {
      const code = entity[1].toLowerCase() === "x"
        ? parseInt(entity.slice(2), 16)
        : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return entities[entity.toLowerCase()] || match;
  });
}

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function isVacancy(text) {
  return VACANCY_MARKERS.some((pattern) => pattern.test(text));
}

function findSkills(text) {
  return SKILLS
    .filter(([, patterns]) => patterns.some((pattern) => pattern.test(text)))
    .map(([name]) => name);
}
