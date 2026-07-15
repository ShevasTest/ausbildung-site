"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { SectionHeader } from "@/components/section-header";

export type ContactQuickLink = {
  label: string;
  value: string;
  href: string;
};

export type ContactFormCopy = {
  title: string;
  intro: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
};

export type ContactSubmitCopy = {
  idle: string;
  sending: string;
  successTitle: string;
  successText: string;
  mailtoTitle: string;
  mailtoText: string;
  errorTitle: string;
  errorText: string;
};

export type ContactValidationCopy = {
  nameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  messageRequired: string;
  messageMin: string;
};

type ContactSectionProps = {
  eyebrow: string;
  title: string;
  intro: string;
  linksTitle: string;
  linksIntro: string;
  quickLinks: ContactQuickLink[];
  availabilityTitle: string;
  availabilityText: string;
  availabilityBadges: string[];
  formCopy: ContactFormCopy;
  submitCopy: ContactSubmitCopy;
  validationCopy: ContactValidationCopy;
  mailSubject: string;
  emailAddress: string;
};

type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

type ContactField = keyof ContactFormValues;
type ContactErrors = Partial<Record<ContactField, string>>;
type SubmitState = "idle" | "sending" | "sent" | "mailto" | "error";

const INITIAL_VALUES: ContactFormValues = {
  name: "",
  email: "",
  message: "",
};

const INITIAL_TOUCHED: Record<ContactField, boolean> = {
  name: false,
  email: false,
  message: false,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE_LENGTH = 24;

function getLinkIcon(href: string) {
  if (href.startsWith("mailto:")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M4.75 7.5A2.75 2.75 0 0 1 7.5 4.75h9A2.75 2.75 0 0 1 19.25 7.5v9A2.75 2.75 0 0 1 16.5 19.25h-9A2.75 2.75 0 0 1 4.75 16.5z" />
        <path d="m6.6 8.3 5.4 4.35 5.4-4.35" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (href.includes("github.com")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M9.5 19.25c-3.9 1.2-3.9-2.2-5.45-2.75" strokeLinecap="round" />
        <path d="M15.4 19.25v-2.77a2.4 2.4 0 0 0-.7-1.78c2.48-.28 5.08-1.22 5.08-5.5a4.3 4.3 0 0 0-1.17-2.98 4 4 0 0 0-.07-2.94s-.95-.3-3.1 1.16a10.6 10.6 0 0 0-5.66 0C7.63 3 6.68 3.3 6.68 3.3a4 4 0 0 0-.07 2.94A4.3 4.3 0 0 0 5.44 9.2c0 4.25 2.57 5.22 5.04 5.5a2.36 2.36 0 0 0-.68 1.78v2.77" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (href.includes("linkedin.com")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <rect x="4.75" y="4.75" width="14.5" height="14.5" rx="2.2" />
        <path d="M8.2 10.25v5.55M8.2 8.45h.01M12 15.8v-3.1a1.8 1.8 0 0 1 3.6 0v3.1M12 12.95V10.25" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M7.75 12h8.5M13.25 6.5l5.5 5.5-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function validateField(
  field: ContactField,
  values: ContactFormValues,
  validationCopy: ContactValidationCopy,
): string | undefined {
  if (field === "name") {
    if (values.name.trim().length < 1) {
      return validationCopy.nameRequired;
    }

    return undefined;
  }

  if (field === "email") {
    const emailValue = values.email.trim();
    if (emailValue.length < 1) {
      return validationCopy.emailRequired;
    }

    if (!EMAIL_PATTERN.test(emailValue)) {
      return validationCopy.emailInvalid;
    }

    return undefined;
  }

  const messageValue = values.message.trim();
  if (messageValue.length < 1) {
    return validationCopy.messageRequired;
  }

  if (messageValue.length < MIN_MESSAGE_LENGTH) {
    return validationCopy.messageMin;
  }

  return undefined;
}

function validateForm(values: ContactFormValues, validationCopy: ContactValidationCopy): ContactErrors {
  const nextErrors: ContactErrors = {};

  (Object.keys(values) as ContactField[]).forEach((field) => {
    const fieldError = validateField(field, values, validationCopy);
    if (fieldError) {
      nextErrors[field] = fieldError;
    }
  });

  return nextErrors;
}

export function ContactSection({
  eyebrow,
  title,
  intro,
  linksTitle,
  linksIntro,
  quickLinks,
  availabilityTitle,
  availabilityText,
  availabilityBadges,
  formCopy,
  submitCopy,
  validationCopy,
  mailSubject,
  emailAddress,
}: ContactSectionProps) {
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Record<ContactField, boolean>>(INITIAL_TOUCHED);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [honeypot, setHoneypot] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const contactEmail = useMemo(() => {
    const directMail = quickLinks.find((link) => link.href.startsWith("mailto:"));
    if (directMail?.href) {
      return directMail.href.replace("mailto:", "").trim();
    }

    return emailAddress.trim();
  }, [quickLinks, emailAddress]);

  const handleChange = (field: ContactField) => {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValue = event.target.value;
      const nextValues = { ...values, [field]: nextValue };

      setValues(nextValues);
      if (submitState === "sent" || submitState === "mailto" || submitState === "error") {
        setSubmitState("idle");
      }

      if (!touched[field]) {
        return;
      }

      const fieldError = validateField(field, nextValues, validationCopy);
      setErrors((previousErrors) => ({
        ...previousErrors,
        [field]: fieldError,
      }));
    };
  };

  const handleBlur = (field: ContactField) => {
    setTouched((previousTouched) => ({
      ...previousTouched,
      [field]: true,
    }));

    const fieldError = validateField(field, values, validationCopy);
    setErrors((previousErrors) => ({
      ...previousErrors,
      [field]: fieldError,
    }));
  };

  const openMailFallback = () => {
    if (!contactEmail) {
      return;
    }

    const subject = encodeURIComponent(mailSubject);
    const body = encodeURIComponent(
      `Name: ${values.name.trim()}\nE-Mail: ${values.email.trim()}\n\n${values.message.trim()}`,
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setTouched({
      name: true,
      email: true,
      message: true,
    });

    const nextErrors = validateForm(values, validationCopy);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitState("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          website: honeypot,
        }),
      });

      if (response.ok) {
        setSubmitState("sent");
        setValues(INITIAL_VALUES);
        setTouched(INITIAL_TOUCHED);
        return;
      }

      if (response.status === 503) {
        openMailFallback();
        setSubmitState("mailto");
        return;
      }

      setSubmitState("error");
    } catch {
      setSubmitState("error");
    }
  };

  const statusCopy =
    submitState === "sent"
      ? { title: submitCopy.successTitle, text: submitCopy.successText }
      : submitState === "mailto"
        ? { title: submitCopy.mailtoTitle, text: submitCopy.mailtoText }
        : submitState === "error"
          ? { title: submitCopy.errorTitle, text: submitCopy.errorText }
          : null;

  return (
    <section id="contact" className="section-deferred scroll-mt-28 py-12 sm:py-20">
      <SectionHeader eyebrow={eyebrow} title={title} intro={intro} />

      <div className="mt-8 grid gap-4 lg:grid-cols-[0.94fr_1.06fr]">
        <article className="rounded-3xl border border-border bg-card p-4 sm:p-6">
          <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
            {linksTitle}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{linksIntro}</p>

          <ul className="mt-5 space-y-3">
            {quickLinks.map((link) => {
              const isExternal = link.href.startsWith("http");

              return (
                <li key={`${link.label}-${link.href}`}>
                  <a
                    href={link.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                    className="contact-link-card group flex items-start gap-3 rounded-2xl border border-border bg-background/70 p-3"
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <span className="h-5 w-5">{getLinkIcon(link.href)}</span>
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">{link.label}</span>
                      <span className="contact-link-value mt-0.5 block text-xs text-muted">
                        {link.value}
                      </span>
                    </span>

                    <span
                      aria-hidden
                      className="inline-flex text-sm text-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
                    >
                      →
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>

          <article className="mt-5 rounded-2xl border border-border bg-background/75 p-4">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">{availabilityTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{availabilityText}</p>

            <ul className="mt-3 flex flex-wrap gap-2">
              {availabilityBadges.map((badge) => (
                <li key={badge}>
                  <span className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {badge}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </article>

        <article className="rounded-3xl border border-border bg-card p-4 sm:p-6">
          <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
            {formCopy.title}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{formCopy.intro}</p>

          <form className="mt-5 space-y-4" noValidate onSubmit={handleSubmit}>
            <div>
              <label htmlFor="contact-name" className="text-sm font-semibold text-foreground">
                {formCopy.nameLabel}
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                value={values.name}
                onChange={handleChange("name")}
                onBlur={() => handleBlur("name")}
                placeholder={formCopy.namePlaceholder}
                autoComplete="name"
                required
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
                className="contact-field mt-2 w-full rounded-2xl px-3.5 py-2.5 text-sm"
              />
              {errors.name ? (
                <p id="contact-name-error" className="mt-1.5 text-xs font-medium text-rose-500">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="contact-email" className="text-sm font-semibold text-foreground">
                {formCopy.emailLabel}
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange("email")}
                onBlur={() => handleBlur("email")}
                placeholder={formCopy.emailPlaceholder}
                autoComplete="email"
                required
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                className="contact-field mt-2 w-full rounded-2xl px-3.5 py-2.5 text-sm"
              />
              {errors.email ? (
                <p id="contact-email-error" className="mt-1.5 text-xs font-medium text-rose-500">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="hidden" aria-hidden>
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="text-sm font-semibold text-foreground">
                {formCopy.messageLabel}
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={values.message}
                onChange={handleChange("message")}
                onBlur={() => handleBlur("message")}
                placeholder={formCopy.messagePlaceholder}
                rows={5}
                minLength={MIN_MESSAGE_LENGTH}
                required
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                className="contact-field mt-2 w-full resize-y rounded-2xl px-3.5 py-2.5 text-sm"
              />
              {errors.message ? (
                <p id="contact-message-error" className="mt-1.5 text-xs font-medium text-rose-500">
                  {errors.message}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={submitState === "sending"}
              className="contact-submit inline-flex w-full items-center justify-center rounded-full bg-primary-solid px-4 py-3 text-sm font-semibold text-white"
            >
              {submitState === "sending" ? submitCopy.sending : submitCopy.idle}
            </button>

            <div
              aria-live="polite"
              className={`contact-status rounded-2xl border p-3 ${
                submitState === "error"
                  ? "border-rose-400/40 bg-rose-500/10"
                  : "border-primary/25 bg-primary/10"
              } ${statusCopy ? "is-visible" : ""}`}
            >
              {statusCopy ? (
                <>
                  <p
                    className={`text-sm font-semibold ${
                      submitState === "error" ? "text-rose-500" : "text-primary"
                    }`}
                  >
                    {statusCopy.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{statusCopy.text}</p>
                </>
              ) : null}
            </div>
          </form>
        </article>
      </div>
    </section>
  );
}
