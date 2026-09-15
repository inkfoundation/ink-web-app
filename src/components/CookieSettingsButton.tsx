import { TextUnderline } from "@/components/TextUnderline";

interface CookieSettingsButtonProps {}

export const CookieSettingsButton: React.FC<CookieSettingsButtonProps> = () => {
  return (
    <button
      className="group relative text-left"
      onClick={() => {
        window.OneTrust?.ToggleInfoDisplay();
      }}
    >
      <div className="relative inline-block">Cookie Settings</div>
      <TextUnderline halfOpacity />
    </button>
  );
};
