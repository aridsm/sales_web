export default function LocaleScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            let store = localStorage.getItem("sales_web_locale");
            if (store) {
              const locale = JSON.parse(store).state.locale;
              if (locale) {
                document.documentElement.lang = locale;
              }
            } else {
              document.documentElement.lang = "pt-BR";
            }
          } catch (e) {}
        `,
      }}
    />
  );
}
