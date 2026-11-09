KAISE UPLOAD KAREIN (GitHub, repo: margdarshan, branch: main)

Is zip ko EXTRACT karo. Andar 4 files hain, apne folders ke saath:

  sitemap.xml                 (repo root me - purani file REPLACE hogi)
  _layouts/default.html       (REPLACE)
  _includes/seo-thin.html     (NAYI file)
  _data/seo_thin.yml          (NAYI file)

GitHub me: "Add file" -> "Upload files" -> in files/folders ko drag-drop karo
(folder structure same rehna chahiye) -> Commit changes.
README-UPLOAD.txt ko upload karna zaroori nahi.

Kya badlega:
  * /us/colleges/<state>/<city>/ , /colleges/<state>/<city>/<course>.html ,
    /coaching/<state>/<city>/<course>.html  -> noindex, follow + sitemap se bahar
  * Baaki sab pages (careers, roadmaps, state, learn, hubs ...) bilkul waise hi.
  * Pages live rahenge, visitors ko dikhenge.

Wapas lana ho to: _data/seo_thin.yml me us rule ko delete karke commit karo.
