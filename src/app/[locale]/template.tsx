type LocaleTemplateProps = {
  children: React.ReactNode;
};

export default function LocaleTemplate({ children }: LocaleTemplateProps) {
  return <div className="page-transition-shell">{children}</div>;
}
