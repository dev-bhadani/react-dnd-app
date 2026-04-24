import { createTheme } from '@mui/material/styles';

/**
 * Centralized MUI theme — minimal SaaS direction:
 *   - Slate neutrals + a single indigo accent
 *   - 8-pt spacing grid (MUI default), 12px component radius
 *   - Inter as primary type, with system fallback
 *   - Soft shadows (no harsh defaults)
 *
 * Anything visual that previously lived as inline `sx` color overrides should
 * be expressed via this theme instead.
 */
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#4f46e5', // indigo-600
            dark: '#4338ca',
            light: '#818cf8',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#0ea5e9', // sky-500
            contrastText: '#ffffff',
        },
        success: { main: '#16a34a' },
        warning: { main: '#d97706' },
        error: { main: '#dc2626' },
        background: {
            default: '#f6f8fc',
            paper: '#ffffff',
        },
        text: {
            primary: '#0f172a',
            secondary: '#475569',
        },
        divider: '#e2e8f0',
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        h1: { fontWeight: 700, letterSpacing: '-0.02em' },
        h2: { fontWeight: 700, letterSpacing: '-0.02em' },
        h3: { fontWeight: 700, letterSpacing: '-0.01em' },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 600 },
        button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
        overline: { fontWeight: 600, letterSpacing: '0.12em' },
    },
    shadows: [
        'none',
        '0 1px 2px rgba(15, 23, 42, 0.06)',
        '0 2px 6px rgba(15, 23, 42, 0.06)',
        '0 4px 12px rgba(15, 23, 42, 0.08)',
        '0 6px 20px rgba(15, 23, 42, 0.08)',
        '0 10px 25px rgba(15, 23, 42, 0.10)',
        '0 14px 30px rgba(15, 23, 42, 0.10)',
        '0 16px 36px rgba(15, 23, 42, 0.12)',
        '0 18px 40px rgba(15, 23, 42, 0.12)',
        '0 20px 44px rgba(15, 23, 42, 0.12)',
        '0 22px 48px rgba(15, 23, 42, 0.14)',
        '0 24px 52px rgba(15, 23, 42, 0.14)',
        '0 26px 56px rgba(15, 23, 42, 0.16)',
        '0 28px 60px rgba(15, 23, 42, 0.16)',
        '0 30px 64px rgba(15, 23, 42, 0.18)',
        '0 32px 68px rgba(15, 23, 42, 0.18)',
        '0 34px 72px rgba(15, 23, 42, 0.20)',
        '0 36px 76px rgba(15, 23, 42, 0.20)',
        '0 38px 80px rgba(15, 23, 42, 0.22)',
        '0 40px 84px rgba(15, 23, 42, 0.22)',
        '0 42px 88px rgba(15, 23, 42, 0.24)',
        '0 44px 92px rgba(15, 23, 42, 0.24)',
        '0 46px 96px rgba(15, 23, 42, 0.26)',
        '0 48px 100px rgba(15, 23, 42, 0.26)',
        '0 50px 104px rgba(15, 23, 42, 0.28)',
    ],
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: { borderRadius: 10, paddingInline: 16 },
            },
        },
        MuiTextField: {
            defaultProps: { size: 'small' },
        },
        MuiPaper: {
            styleOverrides: {
                rounded: { borderRadius: 16 },
            },
        },
        MuiTooltip: {
            defaultProps: { arrow: true },
        },
    },
});

export default theme;

