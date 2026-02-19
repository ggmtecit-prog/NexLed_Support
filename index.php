<!doctype html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Área de Suporte</title>
  <link rel="stylesheet" href="css/style.css" />
  <!--n
    Frame/layout only: no CSS. Use this file as the structural scaffold.
    Add visual styling later in a separate CSS file.
  -->
</head>
<body>

  <!-- Header: logo on left, search in center, account/help links on right -->
  <header>
    <table width="100%" cellpadding="8" cellspacing="0" role="presentation">
      <tr>
        <td align="left" valign="middle">
          <h1 style="margin:0"><a href="index.php" aria-label="Ir para a página principal do suporte">Nexled</a></h1>
        </td>
        <td align="center" valign="middle">
          <form action="search.html" method="get" role="search" aria-label="Pesquisar no suporte">
            <label for="q" class="visually-hidden">Pesquisar</label>
            <input type="search" id="q" name="q" placeholder="Pesquisar" aria-label="Campo de pesquisa" />
            <button type="submit" aria-label="Pesquisar">Pesquisar</button>
          </form>
        </td>
        <td align="right" valign="middle">
          <!-- account links removed per request -->
        </td>
      </tr>
    </table>
  </header>

  <!-- Primary navigation -->


  <!-- Main content area: a two-column layout using a table (main + aside) -->
  <main>
    <table width="100%" cellpadding="12" cellspacing="0" role="presentation">
      <tr>
        <!-- Main column: grid of big action buttons (full width after removing aside) -->
        <td width="100%" valign="top">
          <div class="container">
          <h2 class="main-title">Suporte Nexled</h2>

          <!-- Grid of buttons (2 rows x 3 columns) -->
          <div class="buttons-grid">
          <table width="100%" cellpadding="10" cellspacing="10" role="presentation">
            <tr>
              <td align="center" valign="middle">
                <button type="button" onclick="window.location.href='repair.php'" aria-label="Reparações e assistência">Reparações</button>
                <div>Reparações e assistência</div>
              </td>
              <td align="center" valign="middle">
                <button type="button" onclick="window.location.href='warranty.html'" aria-label="Garantia e serviços">Garantia</button>
                <div>Garantia, Serviços e Peças</div>
              </td>
              <td align="center" valign="middle">
                <button type="button" onclick="window.location.href='downloads.html'" aria-label="Downloads">Downloads</button>
                <div>Manuais e software</div>
              </td>
            </tr>
          </table>
          </div>

          <!-- FAQ section (centered) -->
          <section id="faq" aria-labelledby="faq-heading">
            <h3 id="faq-heading">Perguntas Frequentes</h3>
            <dl>
              <dt>Como inicio um pedido de suporte?</dt>
              <dd>Visite a página de contacto ou utilize a opção de agendamento para marcar uma sessão.</dd>

              <dt>Quanto tempo demora uma reparação?</dt>
              <dd>O tempo depende do tipo de reparação. Consulte o artigo sobre reparações para estimativas.</dd>

              <dt>Onde posso obter manuais?</dt>
              <dd>Os manuais estão disponíveis na secção de Downloads/Manuais.</dd>
            </dl>
          </section>
          </div>
        </td>


        <!-- Aside removed per user request -->
      </tr>
    </table>
  </main>

  <!-- Footer with legal and additional links -->
  <footer>
    <table width="100%" cellpadding="8" cellspacing="0" role="presentation">
      <tr>
        <td align="left">&copy; <span id="year">2025</span> Nexled </td>
        <td align="right">
          <a href="privacy.html">Privacidade</a> |
          <a href="terms.html">Termos</a>
        </td>
      </tr>
    </table>
  </footer>

</body>
</html>
