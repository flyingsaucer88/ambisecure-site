# GSC “Crawled – currently not indexed” — static remediation audit

Source CSV: `docs/audits/gsc/crawled-not-indexed-2026-06-12.csv`  
Affected URLs: **149**  
Thin-content threshold: <250 words  
Disposition is *predicted* from committed `.htaccess` + files on disk (offline).

## Action summary

| Action | Count | Meaning |
|---|---:|---|
| OK_INDEXABLE | 11 | Healthy 200; crawl-budget/authority delay |
| C_REDIRECT | 2 | 301 redirect (already or should be) |
| E_GONE | 136 | 410/404 legacy cruft — correctly not indexed |

## By section

| Section | Count |
|---|---:|
| legacy .htm/.html cruft | 136 |
| solution/product | 8 |
| legal/utility/about | 3 |
| blog post | 1 |
| other | 1 |

## Predicted server disposition

| HTTP | Count |
|---:|---:|
| 200 | 11 |
| 301 | 2 |
| 410 | 136 |

## Conflicts

None detected (no sitemap URL redirects/410s/404s/noindexes; every 200 page has exactly one `<h1>`).

## Duplicate metadata among affected pages

- **title** `Solutions — passwordless, IoT root of trust, provisioning | AmbiSecure` shared by: /solutions/, /solutions/
- **description** shared by: /solutions/, /solutions/

## Real (200) pages — the actionable set

| Path | Action | Words | Inbound | Title len | Desc len | In sitemap | Reason |
|---|---|---:|---:|---:|---:|:--:|---|
| `/` | OK_INDEXABLE | 2040 | 317 | 62 | 159 | yes | healthy 200 (2040w, 317 inbound) — likely a crawl-budget/authority delay |
| `/about/` | OK_INDEXABLE | 652 | 3 | 68 | 166 | yes | healthy 200 (652w, 3 inbound) — likely a crawl-budget/authority delay |
| `/about/certifications/` | OK_INDEXABLE | 1115 | 8 | 67 | 156 | yes | healthy 200 (1115w, 8 inbound) — likely a crawl-budget/authority delay |
| `/blog/secure-iot-identity-with-applets/` | OK_INDEXABLE | 1488 | 5 | 50 | 153 | yes | healthy 200 (1488w, 5 inbound) — likely a crawl-budget/authority delay |
| `/products/` | OK_INDEXABLE | 784 | 5 | 69 | 168 | yes | healthy 200 (784w, 5 inbound) — likely a crawl-budget/authority delay |
| `/products/iot-security-coprocessor/` | OK_INDEXABLE | 2888 | 36 | 63 | 146 | yes | healthy 200 (2888w, 36 inbound) — likely a crawl-budget/authority delay |
| `/products/javacard-applets/` | OK_INDEXABLE | 491 | 21 | 56 | 168 | yes | healthy 200 (491w, 21 inbound) — likely a crawl-budget/authority delay |
| `/products/onepass-card/` | OK_INDEXABLE | 492 | 36 | 55 | 154 | yes | healthy 200 (492w, 36 inbound) — likely a crawl-budget/authority delay |
| `/services/javacard-development/` | OK_INDEXABLE | 483 | 26 | 58 | 157 | yes | healthy 200 (483w, 26 inbound) — likely a crawl-budget/authority delay |
| `/solutions/` | OK_INDEXABLE | 442 | 4 | 70 | 139 | yes | healthy 200 (442w, 4 inbound) — likely a crawl-budget/authority delay |
| `/solutions/` | OK_INDEXABLE | 442 | 4 | 70 | 139 | yes | healthy 200 (442w, 4 inbound) — likely a crawl-budget/authority delay |

## Redirected / 410 / 404 URLs (no action needed unless noted)

| Path | HTTP | Detail |
|---|---:|---|
| `/cyber-security-threats/` | 301 | 301 -> /blog/cyber-security-threats-overview/ |
| `/services/java-card-development/` | 301 | 301 -> /services/javacard-development/ |
| `/100180190.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/103153490.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/103375666.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/10389180.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/104307300.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/107448716.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/109388198.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/119336934.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/119366190.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/121149004.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/122077034.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/122989906.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/12305342.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/123718974.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/127700546.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/130521948.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/134560230.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/140671554.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/142355152.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/143117186.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/14517986.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/145835344.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/14600878.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/149475702.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/150153360.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/153225028.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/154324036.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/15544278.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/159272752.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/161976282.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/162456568.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/162708848.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/162751672.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/16304934.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/163536284.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/166862988.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/171237290.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/171766866.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/177759258.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/18539732.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/187430274.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/191683312.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/193762078.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/198654614.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/19953136.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/202074174.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/204690360.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/205205944.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/207102814.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/207184964.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/209831784.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/210811330.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/211306244.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/21211992.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/212125094.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/220866490.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/222691492.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/227259880.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/228365672.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/228769214.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/228987150.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/22974878.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/231781734.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/238219856.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/242235666.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/247309886.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/249710044.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/252305560.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/252863120.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/254773134.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/25829988.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/25906202.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/259256404.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/260365694.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/260857958.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/261248886.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/261518550.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/265463234.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/266914374.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/271217338.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/272302884.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/272316240.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/27292470.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/289274544.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/289892630.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/290234692.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/290846842.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/295479466.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/295583240.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/296910996.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/299521564.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/300748832.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/300860662.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/305669776.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/307939130.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/308900232.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/310324872.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/31152142.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/316133990.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/316228012.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/317104420.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/317473618.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/320269050.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/320380774.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/35923944.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/36599800.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/37676124.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/38150156.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/41948454.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/4852376.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/55830214.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/56796298.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/56917032.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/60431674.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/60461460.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/62555914.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/63975360.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/67276200.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/71177530.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/71913912.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/72130470.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/73661640.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/76198220.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/77242320.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/81945964.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/85092786.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/87653852.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/90165628.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/93138292.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/97568138.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/97949314.htm` | 410 | htaccess [G] pattern ^[0-9]{6,10}\.htm$ |
| `/eusdh/c2784685.html` | 410 | htaccess [G] pattern ^[a-z]{5}/[a-z][0-9]{6,8}\.html$ |
| `/fhclr/w2919333.html` | 410 | htaccess [G] pattern ^[a-z]{5}/[a-z][0-9]{6,8}\.html$ |
| `/jvnem/j2675700.html` | 410 | htaccess [G] pattern ^[a-z]{5}/[a-z][0-9]{6,8}\.html$ |
| `/mmuly/n1542546.html` | 410 | htaccess [G] pattern ^[a-z]{5}/[a-z][0-9]{6,8}\.html$ |
| `/xghux/c2792641.html` | 410 | htaccess [G] pattern ^[a-z]{5}/[a-z][0-9]{6,8}\.html$ |

