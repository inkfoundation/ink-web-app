import { useTranslations } from "next-intl";

const INITIAL_COPY = `# foundry.toml
[rpc_endpoints]
ink = "https://rpc-gel.inkonchain.com"`;

export function CodeStory({ snippetId }: { snippetId: string }) {
  const t = useTranslations("Home");

  return (
    <div className="about-ship">
      <h2 className="headline headline--sm">{t("shipHeadline")}</h2>
      <div className="code" data-code-story data-scene="build">
        <div className="code__bar">
          <div
            className="code__steps"
            role="group"
            aria-label={t("codeStoryLabel")}
          >
            <span className="code__thumb" data-code-thumb aria-hidden="true" />
            <button
              className="code__step"
              type="button"
              data-code-step="0"
              data-current
              aria-current="step"
            >
              {t("codeStepBuild")}
            </button>
            <button
              className="code__step"
              type="button"
              data-code-step="1"
              aria-current="false"
            >
              {t("codeStepTest")}
            </button>
            <button
              className="code__step"
              type="button"
              data-code-step="2"
              aria-current="false"
            >
              {t("codeStepDeploy")}
            </button>
            <button
              className="code__step"
              type="button"
              data-code-step="3"
              aria-current="false"
            >
              {t("codeStepLive")}
            </button>
          </div>
        </div>
        <pre>
          <code className="code__snippet" id={snippetId}>
            <span className="code__line">
              <span className="cm">{"# foundry.toml"}</span>
            </span>
            <span className="code__line">&nbsp;</span>
            <span className="code__line">
              <span className="kw">{"[rpc_endpoints]"}</span>
            </span>
            <span className="code__line">
              {"ink = "}
              <span className="str">{'"https://rpc-gel.inkonchain.com"'}</span>
              <span className="code__caret" aria-hidden="true" />
            </span>
          </code>
        </pre>
        <button
          className="code__copy"
          type="button"
          aria-label={t("copyCode")}
          data-copy={`#${snippetId}`}
          data-copy-text={INITIAL_COPY}
        >
          <span className="code__copy-icons" aria-hidden="true">
            <svg
              className="code__icon code__icon--copy"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M6.667 6.667V3.333H16.667V13.333H13.333M13.333 6.667V16.667H3.333V6.667H13.333Z"
                stroke="currentColor"
                strokeWidth="1.667"
                strokeLinecap="round"
              />
            </svg>
            <svg
              className="code__icon code__icon--check"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M4.167 10.417 8.125 14.375 15.833 5.625"
                stroke="currentColor"
                strokeWidth="1.667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
