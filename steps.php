<?php
declare(strict_types=1);

$dataDir = __DIR__ . '/data'; // use root data folder so both DQ and DR subfolders work
$defaultFile = 'DQ/DQ_5.json';
$allowedLangs = ['pt','en','es','fr'];

// Recebe parâmetros

$rawFile = isset($_GET['file']) ? $_GET['file'] : $defaultFile;
$lang = isset($_GET['lang']) && in_array($_GET['lang'], $allowedLangs) ? $_GET['lang'] : 'pt';


// Normalize file parameter: prevent backslashes, strip leading slashes
// Normalize slashes and remove any leading slashes
$rawFile = str_replace('\\', '/', (string)$rawFile);
$rawFile = ltrim($rawFile, '/');

// Reject any directory traversal attempts explicitly
if (strpos($rawFile, '..') !== false) {
  http_response_code(404);
  echo "Conteúdo inválido.";
  exit;
}

// Allow nested paths like 'DQ/DQ_1.json' but explicitly block traversal sequences
// Keep a conservative filename policy for the actual filename component
$file = $rawFile;

// Extract just the basename and validate it to ensure it looks like 'NAME.json'
$base = basename($file);
if (!preg_match('/^[A-Za-z0-9._-]+\.json$/', $base)) {
  http_response_code(404);
  echo "Conteúdo inválido.";
  exit;
}

// Caminho seguro para o ficheiro: calcular realpath do dataDir primeiro
$dataDirReal = realpath($dataDir);
if ($dataDirReal === false) {
  http_response_code(500);
  echo "Configuração inválida: dataDir não existe.";
  exit;
}

$jsonPath = realpath($dataDirReal . DIRECTORY_SEPARATOR . $file);

// Segurança: garantir que o ficheiro fica dentro de dataDir
if ($jsonPath === false || strpos($jsonPath, $dataDirReal . DIRECTORY_SEPARATOR) !== 0 || !is_readable($jsonPath)) {
  http_response_code(404);
  echo "Conteúdo não encontrado.";
  exit;
}

// Ler e decodificar JSON
$jsonRaw = file_get_contents($jsonPath);
$content = json_decode($jsonRaw, true);
if (!is_array($content)) {
    http_response_code(500);
    echo "Erro a ler ficheiro JSON.";
    exit;
}

// Helper para obter texto com fallback
// Helper para obter texto com fallback (retorna já escapado)
function t($node, $lang, $fallback = '') {
  if (!is_array($node)) return htmlspecialchars($fallback, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  if (isset($node[$lang]) && $node[$lang] !== '') return htmlspecialchars($node[$lang], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  // fallback to pt or first available
  if (isset($node['pt']) && $node['pt'] !== '') return htmlspecialchars($node['pt'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  foreach ($node as $v) {
    if ($v !== '') return htmlspecialchars((string)$v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  }
  return htmlspecialchars($fallback, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// Sanitiza src de imagens: bloqueia esquemas/protocolos externos (http:, //, data:, etc.), remove null bytes
// and resolve relative paths against the JSON file location so paths like "../../img/..." work.
// Returns an escaped web-path or empty string if not allowed.
function sanitize_image_src($src, $jsonPath = null, $jsonFilename = null) {
  $src = trim((string)$src);
  $src = str_replace("\0", '', $src);
  if ($src === '') return '';

  // bloqueia URIs com esquema (http:, https:, data:, javascript:, etc.) e protocolo-protocol-relative
  if (preg_match('#^[a-zA-Z][a-zA-Z0-9+.-]*:#', $src) || strpos($src, '//') === 0) {
    return '';
  }

  // If the src is an absolute web path (starts with '/'), allow it if it remains inside project when mapped.
  if (strpos($src, '/') === 0) {
    return htmlspecialchars($src, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  }

  // Try resolving relative to the JSON file location when provided.
  if ($jsonPath) {
    $candidate = realpath(dirname($jsonPath) . DIRECTORY_SEPARATOR . $src);
    $projectRoot = realpath(__DIR__);
    if ($candidate && $projectRoot && strpos($candidate, $projectRoot) === 0 && is_file($candidate)) {
      // Build web path from project-root-relative path
      $relative = str_replace('\\','/', substr($candidate, strlen($projectRoot)) );
      if ($relative === '' || $relative[0] !== '/') $relative = '/' . $relative;
      $webBase = dirname($_SERVER['SCRIPT_NAME']);
      if ($webBase === '/' || $webBase === '\\') $webBase = '';
      $webPath = $webBase . $relative;
      return htmlspecialchars($webPath, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    // If not found, try resolving against probable original template folders (repairs/DQ or repairs/DR)
    $projectRoot = realpath(__DIR__);
    if ($projectRoot && $jsonFilename) {
      $prefix = strtoupper(substr($jsonFilename,0,3));
      $altDir = null;
      if (strpos($prefix, 'DQ_') === 0 || strpos($jsonFilename, 'DQ_') === 0) {
        $altDir = $projectRoot . DIRECTORY_SEPARATOR . 'repairs' . DIRECTORY_SEPARATOR . 'DQ';
      } elseif (strpos($prefix, 'DR_') === 0 || strpos($jsonFilename, 'DR_') === 0) {
        $altDir = $projectRoot . DIRECTORY_SEPARATOR . 'repairs' . DIRECTORY_SEPARATOR . 'DR';
      } else {
        $altDir = $projectRoot . DIRECTORY_SEPARATOR . 'repairs';
      }
      if ($altDir) {
        $candidate2 = realpath($altDir . DIRECTORY_SEPARATOR . $src);
        if ($candidate2 && strpos($candidate2, $projectRoot) === 0 && is_file($candidate2)) {
          $relative = str_replace('\\','/', substr($candidate2, strlen($projectRoot)) );
          if ($relative === '' || $relative[0] !== '/') $relative = '/' . $relative;
          $webBase = dirname($_SERVER['SCRIPT_NAME']);
          if ($webBase === '/' || $webBase === '\\') $webBase = '';
          $webPath = $webBase . $relative;
          return htmlspecialchars($webPath, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        }
      }
    }
  }

  // Fallback: return the original relative path escaped (will be resolved by browser relative to current page)
  return htmlspecialchars($src, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// Preparar itens
$pageTitle = t($content['meta']['title_tag'] ?? $content['idconteudo'] ?? null, $lang, 'Untitled');
$mainTitle = t($content['idconteudo'] ?? null, $lang, '');
$timeText = t($content['meta']['tempo_estimado'] ?? null, $lang, '');
$parts = $content['parts'] ?? [];
$steps = $content['steps'] ?? [];
$footer = $content['footer'] ?? [];

// CSS path (dynamic, with cache-busting using filemtime when available)
$cssFileLocal = __DIR__ . '/css/style.css';
$cssBase = dirname($_SERVER['SCRIPT_NAME']);
if ($cssBase === '/' || $cssBase === '\\') $cssBase = '';
$cssHref = $cssBase . '/css/style.css';
if (file_exists($cssFileLocal)) {
    $cssHref .= '?v=' . filemtime($cssFileLocal);
}
?>
<!doctype html>
<html lang="<?= htmlspecialchars($lang) ?>">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= $pageTitle ?></title>
  <link rel="stylesheet" href="<?= htmlspecialchars($cssHref, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?>">
</head>
<body>
  <header>
    <table width="100%" cellpadding="8" cellspacing="0" role="presentation">
      <tr>
        <td align="left"><h1><a href="../Website_Suporte/index.php">Nexled</a></h1></td>
        <td align="right">
          <a href="../../repair.html"><?= t($footer['back_link_text'] ?? ['pt'=>'Voltar'], $lang, 'Voltar') ?></a>
          <?php
            // Language switcher form: submits current file with new lang
            $script = htmlspecialchars($_SERVER['SCRIPT_NAME'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            $fileHidden = htmlspecialchars($file, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
          ?>
          <form method="get" action="<?= $script ?>" style="display:inline-block;margin-left:12px;">
            <input type="hidden" name="file" value="<?= $fileHidden ?>">
            <label for="lang-select" style="margin-right:6px">Lang</label>
            <select id="lang-select" name="lang" onchange="this.form.submit()">
              <?php foreach ($allowedLangs as $al): ?>
                <option value="<?= htmlspecialchars($al, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?>" <?= $al === $lang ? 'selected' : '' ?>><?= strtoupper(htmlspecialchars($al, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')) ?></option>
              <?php endforeach; ?>
            </select>
          </form>
        </td>
      </tr>
    </table>
  </header>

  <main>
    <article class="guide container">
      <h2 class="main-title"><?= $mainTitle ?></h2>
      <?php if ($timeText): ?><h3 class="time"><?= $timeText ?></h3><?php endif; ?>
      <button onclick="window.print()">Print this page</button>

      <section class="parts">
        <h3>Peças e Ferramentas necessárias</h3>
        <div class="parts-list">
          <?php foreach ($parts as $p): 
            $img = sanitize_image_src($p['image'] ?? '', $jsonPath, $file);
            $alt = t($p['alt'] ?? null, $lang, '');
            $name = t($p['name'] ?? null, $lang, '');
            $sku = htmlspecialchars($p['sku'] ?? '');
          ?>
          <div class="part-card">
            <?php if ($img): ?><img src="<?= $img ?>" alt="<?= $alt ?>" /><?php endif; ?>
            <strong><?= $name ?></strong>
            <?php if ($sku): ?><div class="sku">SKU: <?= $sku ?></div><?php endif; ?>
          </div>
          <?php endforeach; ?>
        </div>
      </section>

      <section class="user-steps">
  <h3><?= t($content['meta']['section_title'] ?? ['pt'=>'Passos para técnicos'], $lang, 'Passos para técnicos') ?></h3>

        <?php foreach ($steps as $step): 
          $stepTitle = t($step['title'] ?? null, $lang, '');
          $stepImg = sanitize_image_src($step['image'] ?? '', $jsonPath, $file);
          $stepImgAlt = t($step['image_alt'] ?? null, $lang, '');
          $stepDesc = t($step['description'] ?? null, $lang, '');
        ?>
        <div class="inst-card">
          <header class="inst-card-header"><div class="card-title"><?= $stepTitle ?></div></header>
          <?php if ($stepImg): ?><div class="inst-card-image"><img src="<?= $stepImg ?>" alt="<?= $stepImgAlt ?>" /></div><?php endif; ?>
          <div class="inst-card-content"><p class="card-description"><?= $stepDesc ?></p></div>
        </div>
        <?php endforeach; ?>
      </section>
    </article>
  </main>

  <footer>
    <table width="100%" cellpadding="8" cellspacing="0" role="presentation">
      <tr>
  <td align="left"><?= t($footer['copyright'] ?? null, $lang, '© 2025 Nexled') ?></td>
  <td align="right"><a href="../../repair.html"><?= t($footer['back_link_text'] ?? null, $lang, 'Voltar') ?></a></td>
      </tr>
    </table>
  </footer>
</body>
</html>
