window.PREPBASE_SKILL_STATS = {
  "updatedAt": "2026-05-22T00:29:45.721Z",
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
  "totalSearchResults": 4858,
  "totalVacancies": 1,
  "detailsFetched": 1994,
  "sourceStats": [
    {
      "source": "https://hh.ru/",
      "name": "hh.ru",
      "engine": "public HTML",
      "authMode": "public_html",
      "searchQueries": 1,
      "pagesFetched": 40,
      "vacancies": 1,
      "errors": [
        "vacancy 133355415: HTTP 502: Страница временно недоступна Похоже, у нас какой-то сбой Ошибка 502 Попробуйте обновить страницу. Если это не поможет, напишите в поддержку на адрес error@hh.ru Чтобы ответ пришёл "
      ]
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
      "found": 4858,
      "pagesFetched": 40,
      "vacancyIds": 1995,
      "warnings": [],
      "errors": []
    }
  ],
  "companyStats": [
    {
      "employerId": "name:компания не указана",
      "name": "Компания не указана",
      "logo": null,
      "vacanciesCount": 1,
      "vacancyIds": [
        "133355415"
      ],
      "roles": {},
      "areas": {},
      "skills": {
        "Коммуникация": 1
      },
      "firstPublishedAt": null,
      "lastPublishedAt": null
    }
  ],
  "companyStatsMeta": {
    "totalCompanies": 1,
    "limit": 50,
    "generatedAt": "2026-05-22T00:29:45.755Z"
  },
  "skills": [
    {
      "name": "Коммуникация",
      "count": 1,
      "sources": {
        "https://hh.ru/": 1
      }
    }
  ],
  "vacancies": [
    {
      "id": "133355415",
      "url": "https://omsk.hh.ru/vacancy/133355415",
      "source": "https://hh.ru/search/vacancy",
      "title": "Вакансия 133355415",
      "employer": null,
      "area": null,
      "date": null,
      "roles": [],
      "skills": [
        "Коммуникация"
      ]
    }
  ],
  "errors": [
    "vacancy 133355415: HTTP 502: Страница временно недоступна Похоже, у нас какой-то сбой Ошибка 502 Попробуйте обновить страницу. Если это не поможет, напишите в поддержку на адрес error@hh.ru Чтобы ответ пришёл "
  ],
  "parserPostprocess": {
    "name": "rebuild-company-stats",
    "generatedAt": "2026-05-22T00:29:45.755Z",
    "source": "vacancies"
  }
};
