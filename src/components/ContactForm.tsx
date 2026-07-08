import { useState, useRef, useCallback } from 'react';

const WEB3FORMS_KEY = 'e4a6e8f1-2b1c-4d5e-9f0a-1b2c3d4e5f6a';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  _gotcha: string; // honeypot
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getRateLimitRemaining(): number {
  try {
    const last = localStorage.getItem('contact_form_last_submit');
    if (!last) return 0;
    const elapsed = Date.now() - parseInt(last, 10);
    const remaining = Math.max(0, 60000 - elapsed);
    return remaining;
  } catch {
    return 0;
  }
}

function setRateLimit(): void {
  try {
    localStorage.setItem('contact_form_last_submit', String(Date.now()));
  } catch {
    // localStorage unavailable (private browsing)
  }
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    _gotcha: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [rateLimitRemaining, setRateLimitRemaining] = useState(getRateLimitRemaining);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campo requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Campo requerido';
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Campo requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear error on change
      if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Check honeypot — silent discard
      if (formData._gotcha) {
        // Bot detected — silently pretend success
        setStatus('success');
        setTimeout(() => setStatus('idle'), 5000);
        return;
      }

      // Check rate limit
      const remaining = getRateLimitRemaining();
      if (remaining > 0) {
        setRateLimitRemaining(remaining);
        setErrors({
          name: 'Esperá un momento antes de enviar otro mensaje',
          email: ' ',
          message: ' ',
        });
        return;
      }

      if (!validate()) return;

      setStatus('loading');

      try {
        const payload = {
          access_key: WEB3FORMS_KEY,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim(),
        };

        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('API error');

        setRateLimit();
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '', _gotcha: '' });
        setErrors({});

        // Auto-dismiss after 5 seconds
        if (successTimerRef.current) clearTimeout(successTimerRef.current);
        successTimerRef.current = setTimeout(() => {
          setStatus('idle');
        }, 5000);
      } catch {
        setStatus('error');
      }
    },
    [formData, validate],
  );

  const isRateLimited = rateLimitRemaining > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Honeypot — hidden from real users */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="_gotcha">No llenar</label>
        <input
          id="_gotcha"
          name="_gotcha"
          type="text"
          value={formData._gotcha}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-1 block font-body text-xs font-semibold uppercase tracking-widest text-ink/40 dark:text-paper/40">
          Nombre *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className={`w-full border-b bg-transparent px-0 py-2 font-body text-base text-ink outline-none transition-colors placeholder:text-ink/20 focus:border-copper dark:text-paper dark:placeholder:text-paper/20 ${
            errors.name ? 'border-red-500' : 'border-stone-300 dark:border-warm-gray'
          }`}
          placeholder="Tu nombre"
        />
        {errors.name && (
          <p className="mt-1 font-body text-xs text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1 block font-body text-xs font-semibold uppercase tracking-widest text-ink/40 dark:text-paper/40">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full border-b bg-transparent px-0 py-2 font-body text-base text-ink outline-none transition-colors placeholder:text-ink/20 focus:border-copper dark:text-paper dark:placeholder:text-paper/20 ${
            errors.email ? 'border-red-500' : 'border-stone-300 dark:border-warm-gray'
          }`}
          placeholder="tu@email.com"
        />
        {errors.email && (
          <p className="mt-1 font-body text-xs text-red-400">{errors.email}</p>
        )}
      </div>

      {/* Phone (optional) */}
      <div>
        <label htmlFor="phone" className="mb-1 block font-body text-xs font-semibold uppercase tracking-widest text-ink/40 dark:text-paper/40">
          Teléfono <span className="font-light normal-case tracking-normal text-ink/30 dark:text-paper/30">(opcional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border-b border-stone-300 bg-transparent px-0 py-2 font-body text-base text-ink outline-none transition-colors placeholder:text-ink/20 focus:border-copper dark:border-warm-gray dark:text-paper dark:placeholder:text-paper/20"
          placeholder="+54 343 ..."
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="mb-1 block font-body text-xs font-semibold uppercase tracking-widest text-ink/40 dark:text-paper/40">
          Mensaje *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className={`w-full border-b bg-transparent px-0 py-2 font-body text-base text-ink outline-none transition-colors placeholder:text-ink/20 focus:border-copper resize-none dark:text-paper dark:placeholder:text-paper/20 ${
            errors.message ? 'border-red-500' : 'border-stone-300 dark:border-warm-gray'
          }`}
          placeholder="Contanos qué te gustaría hacerte..."
        />
        {errors.message && (
          <p className="mt-1 font-body text-xs text-red-400">{errors.message}</p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={status === 'loading' || isRateLimited}
        className="inline-flex items-center gap-2 rounded-sm border border-copper bg-copper px-10 py-3 font-body text-sm font-semibold uppercase tracking-widest text-paper transition-all hover:bg-copper-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'loading' ? (
          <>
            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando...
          </>
        ) : (
          'Enviar mensaje'
        )}
      </button>

      {/* Status messages */}
      {status === 'success' && (
        <div className="rounded-sm border border-green-700 bg-green-900/30 px-4 py-3">
          <p className="font-body text-sm text-green-400">
            Mensaje enviado con éxito. Te respondemos a la brevedad.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-sm border border-red-700 bg-red-900/30 px-4 py-3">
          <p className="font-body text-sm text-red-400">
            Error al enviar. Intenta de nuevo.
          </p>
        </div>
      )}
    </form>
  );
}
