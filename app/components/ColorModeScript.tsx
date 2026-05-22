export default function ColorModeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            let mode = localStorage.getItem("sales_web_color");
            if (mode) {
              mode = JSON.parse(mode).state.mode;
              if (mode === "dark") {
                document.documentElement.classList.add("dark");
              }
            }
          } catch (e) {}
        `,
      }}
    />
  );
}
