/**
 * Curated quick-start templates. Each entry is a plain element-tree that
 * `loadTemplate` feeds into the builder store unchanged.
 *
 * Keep these lightweight — anything heavier should live behind the API.
 */

const id = (() => {
    let n = Date.now();
    return () => ++n;
})();

const text = (name, placeholder = '', extra = {}) => ({
    type: 'text',
    id: id(),
    name,
    placeholder,
    required: false,
    helperText: '',
    width: 'full',
    ...extra,
});

export const TEMPLATES = [
    {
        key: 'blank',
        name: 'Blank canvas',
        description: 'Start from scratch.',
        emoji: '✨',
        elements: [],
    },
    {
        key: 'contact',
        name: 'Contact form',
        description: 'Name, email, message — the essentials.',
        emoji: '📨',
        elements: [
            text('Full name', 'Jane Doe', { required: true }),
            { type: 'email', id: id(), name: 'Email', placeholder: 'jane@example.com', required: true, helperText: '', width: 'full' },
            { type: 'phone', id: id(), name: 'Phone', placeholder: '(555) 123-4567', pattern: '', required: false, helperText: '', width: 'full' },
            { type: 'textarea', id: id(), name: 'Message', placeholder: 'How can we help?', rows: 5, required: true, helperText: '', width: 'full' },
            {
                type: 'button',
                id: id(),
                name: 'Submit',
                label: 'Send message',
                variant: 'contained',
                color: 'primary',
                size: 'medium',
                fullWidth: false,
                typeAttr: 'submit',
                href: '',
                target: '_self',
                startIcon: 'send',
                endIcon: 'none',
                borderRadius: 8,
                disableElevation: false,
                disabled: false,
                loading: false,
            },
        ],
    },
    {
        key: 'signup',
        name: 'Sign-up form',
        description: 'Account creation with terms checkbox.',
        emoji: '🚀',
        elements: [
            {
                type: 'twoColumnRow',
                id: id(),
                name: '',
                columns: [
                    [text('First name', 'Jane', { required: true })],
                    [text('Last name', 'Doe', { required: true })],
                ],
            },
            { type: 'email', id: id(), name: 'Work email', placeholder: 'you@company.com', required: true, helperText: 'We will never share your email.', width: 'full' },
            text('Password', '••••••••', { required: true, helperText: 'At least 8 characters.' }),
            {
                type: 'checkbox',
                id: id(),
                name: 'Terms',
                checkboxLayout: 'vertical',
                required: true,
                helperText: '',
                width: 'full',
                checkboxOptions: [{ label: 'I agree to the Terms of Service and Privacy Policy', checked: false }],
            },
            {
                type: 'button',
                id: id(),
                name: 'Create account',
                label: 'Create account',
                variant: 'contained',
                color: 'primary',
                size: 'large',
                fullWidth: true,
                typeAttr: 'submit',
                href: '',
                target: '_self',
                startIcon: 'none',
                endIcon: 'none',
                borderRadius: 10,
                disableElevation: false,
                disabled: false,
                loading: false,
            },
        ],
    },
    {
        key: 'survey',
        name: 'Customer survey',
        description: 'Rating + multiple-choice + free-form feedback.',
        emoji: '⭐',
        elements: [
            { type: 'rating', id: id(), name: 'Overall satisfaction', max: 5, precision: 1, defaultValue: 0, required: true, helperText: '', width: 'full' },
            {
                type: 'radio',
                id: id(),
                name: 'How likely are you to recommend us?',
                options: ['Very likely', 'Somewhat likely', 'Unlikely'],
                radioLayout: 'horizontal',
                required: true,
                helperText: '',
                width: 'full',
            },
            {
                type: 'checkbox',
                id: id(),
                name: 'What did you enjoy most?',
                checkboxLayout: 'vertical',
                required: false,
                helperText: '',
                width: 'full',
                checkboxOptions: [
                    { label: 'Ease of use', checked: false },
                    { label: 'Speed', checked: false },
                    { label: 'Customer support', checked: false },
                    { label: 'Pricing', checked: false },
                ],
            },
            { type: 'textarea', id: id(), name: 'Anything we should improve?', placeholder: 'Tell us more…', rows: 4, required: false, helperText: '', width: 'full' },
        ],
    },
    {
        key: 'feedback',
        name: 'Bug report',
        description: 'Quick issue report with priority + steps.',
        emoji: '🐛',
        elements: [
            text('Title', 'Short summary of the issue', { required: true }),
            {
                type: 'select',
                id: id(),
                name: 'Severity',
                options: ['Low', 'Medium', 'High', 'Critical'],
                required: true,
                helperText: '',
                width: 'full',
            },
            { type: 'textarea', id: id(), name: 'Steps to reproduce', placeholder: '1.\n2.\n3.', rows: 6, required: true, helperText: '', width: 'full' },
            { type: 'file', id: id(), name: 'Screenshot (optional)', accept: 'image/*', multiple: false, required: false, helperText: '', width: 'full' },
        ],
    },
];

