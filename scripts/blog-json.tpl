{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "headline": "{{HEADLINE}}",
      "description": "{{DESCRIPTION}}",
      "datePublished": "{{DATE}}",
      "image": "{{COVER_URL}}",
      "author": { "@type": "Person", "name": "Анна Щеголихина", "url": "{{SITE}}" },
      "mainEntityOfPage": "{{CANONICAL}}"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Главная", "item": "{{SITE}}" },
        { "@type": "ListItem", "position": 2, "name": "Блог", "item": "{{SITE}}/blog/" },
        { "@type": "ListItem", "position": 3, "name": "{{BREADCRUMB}}", "item": "{{CANONICAL}}" }
      ]
    }
  ]
}
