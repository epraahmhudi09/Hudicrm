import type { ReactNode } from "react";
import { CheckCircle2, Clock, Download, SquareTerminal, Smartphone } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";

function AppCard({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amtel-50 text-amtel-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
        <p className="mt-1 text-sm text-ink-500">{description}</p>
        <div className="mt-3">{action}</div>
      </div>
    </div>
  );
}

function OpenLinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg bg-amtel-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amtel-700"
    >
      <Download size={13} />
      {label}
    </a>
  );
}

export default function DownloadAppsView() {
  const { t } = useLanguage();
  const { canInstall, installed, promptInstall } = useInstallPrompt();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">{t.downloadAppsTitle}</h1>
        <p className="mt-0.5 text-sm text-ink-500">{t.downloadAppsSubtitle}</p>
      </div>

      <div className="space-y-4">
        <AppCard
          icon={<Smartphone size={20} />}
          title={t.downloadAppCrmTitle}
          description={t.downloadAppCrmDesc}
          action={
            installed ? (
              <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <CheckCircle2 size={13} />
                {t.downloadAppCrmInstalled}
              </p>
            ) : canInstall ? (
              <button
                onClick={promptInstall}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amtel-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amtel-700"
              >
                <Download size={13} />
                {t.installApp}
              </button>
            ) : (
              <p className="text-xs text-ink-500">{t.downloadAppCrmManualHint}</p>
            )
          }
        />

        <AppCard
          icon={<SquareTerminal size={20} />}
          title={t.downloadAppTermuxTitle}
          description={t.downloadAppTermuxDesc}
          action={
            <OpenLinkButton href="https://f-droid.org/packages/com.termux/" label={t.downloadOpen} />
          }
        />

        <AppCard
          icon={<SquareTerminal size={20} />}
          title={t.downloadAppTermuxApiTitle}
          description={t.downloadAppTermuxApiDesc}
          action={
            <OpenLinkButton
              href="https://f-droid.org/packages/com.termux.api/"
              label={t.downloadOpen}
            />
          }
        />

        <AppCard
          icon={<Clock size={20} />}
          title={t.downloadAppCronJobTitle}
          description={t.downloadAppCronJobDesc}
          action={<OpenLinkButton href="https://cron-job.org/en/" label={t.downloadOpen} />}
        />
      </div>
    </div>
  );
}
