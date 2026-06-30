window.PREPBASE_SKILL_STATS = {
  "updatedAt": "2026-06-30T11:00:45.811Z",
  "since": null,
  "parser": "hh.ru public search HTML",
  "api": null,
  "authMode": "public_html",
  "queries": [
    "https://omsk.hh.ru/search/vacancy?hhtmFrom=main&hhtmFromLabel=vacancy_search_line&search_field=name&search_field=company_name&search_field=description&enable_snippets=true&L_save_area=true&professional_role=10&professional_role=150&professional_role=148"
  ],
  "searchFields": [
    "name",
    "company_name",
    "description"
  ],
  "area": "from-search-url",
  "sources": [
    "https://hh.ru/"
  ],
  "totalSearchResults": 4689,
  "totalVacancies": 1,
  "detailsFetched": 843,
  "sourceStats": [
    {
      "source": "https://hh.ru/",
      "name": "hh.ru",
      "engine": "public HTML",
      "authMode": "public_html",
      "searchQueries": 1,
      "pagesFetched": 17,
      "vacancies": 1,
      "errors": []
    }
  ],
  "searchStats": [
    {
      "source": "https://hh.ru/",
      "name": "hh.ru public search",
      "query": "https://omsk.hh.ru/search/vacancy?hhtmFrom=main&hhtmFromLabel=vacancy_search_line&search_field=name&search_field=company_name&search_field=description&enable_snippets=true&L_save_area=true&professional_role=10&professional_role=150&professional_role=148",
      "searchField": "public-search-url",
      "area": "omsk.hh.ru",
      "engine": "public HTML",
      "found": 4689,
      "pagesFetched": 17,
      "vacancyIds": 843,
      "warnings": [],
      "errors": []
    }
  ],
  "companyStats": [],
  "companyStatsMeta": {
    "totalCompanies": 0,
    "limit": 500,
    "generatedAt": "2026-06-30T11:01:09.339Z"
  },
  "skills": [
    {
      "name": "Бизнес-анализ",
      "count": 1,
      "sources": {
        "https://hh.ru/": 1
      }
    },
    {
      "name": "Коммуникация",
      "count": 1,
      "sources": {
        "https://hh.ru/": 1
      }
    },
    {
      "name": "Системный анализ",
      "count": 1,
      "sources": {
        "https://hh.ru/": 1
      }
    },
    {
      "name": "API",
      "count": 1,
      "sources": {
        "https://hh.ru/": 1
      }
    },
    {
      "name": "BPMN",
      "count": 1,
      "sources": {
        "https://hh.ru/": 1
      }
    },
    {
      "name": "Excel",
      "count": 1,
      "sources": {
        "https://hh.ru/": 1
      }
    },
    {
      "name": "UML",
      "count": 1,
      "sources": {
        "https://hh.ru/": 1
      }
    }
  ],
  "vacancies": [
    {
      "id": "134543410",
      "url": "https://omsk.hh.ru/vacancy/134543410",
      "source": "https://hh.ru/search/vacancy",
      "title": "Подтвердите, что вы не робот",
      "employer": null,
      "area": null,
      "date": null,
      "roles": [],
      "skills": [
        "Бизнес-анализ",
        "Коммуникация",
        "Системный анализ",
        "API",
        "BPMN",
        "Excel",
        "UML"
      ]
    }
  ],
  "errors": [],
  "parserPostprocess": {
    "name": "rebuild-company-stats",
    "generatedAt": "2026-06-30T11:01:09.339Z",
    "source": "vacancies + hh search html",
    "enrichedVacancies": 251,
    "skippedUnknownCompanies": 1
  }
};
