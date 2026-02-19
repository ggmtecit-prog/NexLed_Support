<?php
// JSON-driven repairs listing
$allowedLangs = ['pt','en','es','fr'];
$lang = isset($_GET['lang']) && in_array($_GET['lang'], $allowedLangs) ? $_GET['lang'] : 'pt';

// Read data/repairs.json
$dataFile = __DIR__ . '/data/repairs.json';
$repairsRaw = is_readable($dataFile) ? file_get_contents($dataFile) : null;
$repairsData = $repairsRaw ? json_decode($repairsRaw, true) : null;
if (!is_array($repairsData)) {
  // fallback minimal data to avoid breaking the page
  $repairsData = ['meta'=>['title'=>['pt'=>'Reparações — Suporte Nexled']],'categories'=>[]];
}

// Helper: translation with fallback to pt then first available
function t($node, $lang, $fallback = '') {
  if (!is_array($node)) return htmlspecialchars($fallback, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  if (isset($node[$lang]) && $node[$lang] !== '') return htmlspecialchars($node[$lang], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  if (isset($node['pt']) && $node['pt'] !== '') return htmlspecialchars($node['pt'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  foreach ($node as $v) { if ($v !== '') return htmlspecialchars((string)$v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
  return htmlspecialchars($fallback, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// sanitize image src (simple: disallow schemes and allow local paths)
function sanitize_image_src_simple($src) {
  $s = trim((string)$src);
  $s = str_replace("\0", '', $s);
  if ($s === '') return '';
  if (preg_match('#^[a-zA-Z][a-zA-Z0-9+.-]*:#', $s) || strpos($s, '//') === 0) return '';
  return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
?>
<!doctype html>
<html lang="<?= htmlspecialchars($lang) ?>">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= t($repairsData['meta']['title'] ?? null, $lang, 'Reparações — Suporte Nexled') ?></title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <table width="100%" cellpadding="8" cellspacing="0" role="presentation">
      <tr>
        <td align="left"><h1><a href="index.php">Nexled</a></h1></td>
        <td align="right">
          <a href="index.php"><?= t(['pt'=>'Voltar','en'=>'Back'],$lang,'Back') ?></a>
          <label for="lang-select" style="margin-left:12px;margin-right:6px">Lang</label>
          <select id="lang-select" aria-label="Select language">
            <?php foreach ($allowedLangs as $al): ?>
              <option value="<?= htmlspecialchars($al, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?>" <?= $al === $lang ? 'selected' : '' ?>><?= strtoupper(htmlspecialchars($al, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')) ?></option>
            <?php endforeach; ?>
          </select>
        </td>
      </tr>
    </table>
  </header>

  <main>
    <div class="categories">
      <?php foreach ($repairsData['categories'] as $cat): ?>
        <section class="category" id="<?= htmlspecialchars($cat['id'] ?? '') ?>">
          <h4><?= t($cat['title'] ?? null, $lang, '') ?></h4>
          <div class="grid">
            <?php foreach ($cat['cards'] as $card): ?>
              <div class="card">
                <?php $img = sanitize_image_src_simple($card['image'] ?? ''); if($img): ?><img src="<?= $img ?>" alt="<?= t($card['title'] ?? null, $lang, '') ?>" class="card-img"><?php endif; ?>
                <h5><?= t($card['title'] ?? null, $lang, '') ?></h5>
                <p><?= t($card['description'] ?? null, $lang, '') ?></p>
                <?php if (!empty($card['repairs']) && is_array($card['repairs'])): ?>
                  <ul class="repair-list">
                    <?php foreach ($card['repairs'] as $r): ?>
                      <?php $file = htmlspecialchars($r['file'] ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); ?>
                      <li><a href="steps.php?file=<?= $file ?>&lang=<?= htmlspecialchars($lang, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?>"><?= t($r['label'] ?? null, $lang, '') ?></a></li>
                    <?php endforeach; ?>
                  </ul>
                <?php endif; ?>
              </div>
            <?php endforeach; ?>
          </div>
        </section>
      <?php endforeach; ?>
    </div>
  </main>

  <footer>
    <table width="100%" cellpadding="8" cellspacing="0" role="presentation">
      <tr>
        <td align="left">&copy; 2025 Nexled</td>
        <td align="right"><a href="index.php"><?= t(['pt'=>'Voltar','en'=>'Back'],$lang,'Back') ?></a></td>
      </tr>
    </table>
  </footer>
  <script>
    // Language behavior:
    // - On change: save to localStorage then reload current page with ?lang=<value>
    // - On initial load: if localStorage has a saved lang different from the current query param, reload with saved lang
    // - Also update all steps.php links to include the selected lang
    (function(){
      var select = document.getElementById('lang-select');
      if(!select) return;

      function updateLinks(lang){
        var anchors = document.querySelectorAll('a[href*="steps.php?file="]');
        anchors.forEach(function(a){
          try{
            var u = new URL(a.href, location.origin + location.pathname);
            if(u.searchParams.has('file')){
              u.searchParams.set('lang', lang);
              a.href = u.pathname + u.search;
            }
          }catch(e){ /* ignore malformed */ }
        });
      }

      // read current lang from URL (if any)
      var params = new URLSearchParams(location.search);
      var currentLang = params.get('lang') || select.value || 'pt';

      // if saved lang exists and differs from currentLang, navigate to include saved lang
      try{
        var saved = localStorage.getItem('nexled.lang');
        if(saved && saved !== currentLang){
          params.set('lang', saved);
          // preserve pathname, set new search
          location.search = params.toString();
          return; // page will reload
        }
      }catch(e){ /* ignore storage errors */ }

      // ensure select shows the active language
      select.value = currentLang;
      updateLinks(currentLang);

      // on change: persist and reload page with new lang param
      select.addEventListener('change', function(){
        var v = select.value;
        try{ localStorage.setItem('nexled.lang', v); }catch(e){}
        var p = new URLSearchParams(location.search);
        p.set('lang', v);
        location.search = p.toString();
      });
    })();
  </script>
</body>
</html>
