// Google Consent Mode v2 — výchozí stav PŘED načtením GTM.
// Vše zakázané (denied); pro vracející se návštěvníky s uloženým souhlasem
// rovnou povolíme. Aktualizaci po kliknutí v liště řeší GoogleTagManager.
export function ConsentInit() {
  const code = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent','default',{
      ad_storage:'denied',
      ad_user_data:'denied',
      ad_personalization:'denied',
      analytics_storage:'denied',
      functionality_storage:'granted',
      security_storage:'granted',
      wait_for_update: 500
    });
    try {
      if (localStorage.getItem('cookie-consent') === 'accepted') {
        gtag('consent','update',{
          ad_storage:'granted',
          ad_user_data:'granted',
          ad_personalization:'granted',
          analytics_storage:'granted'
        });
      }
    } catch (e) {}
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
