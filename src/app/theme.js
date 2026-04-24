import { createTheme } from '@mui/material/styles';

/**
 * One brand → two MUI themes (light + dark). Components must read from this
 * theme rather than hard-coding palette values.
 */
const baseTokens = {
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
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: { root: { borderRadius: 10, paddingInline: 16 } },
        },
        MuiTextField: { defaultProps: { size: 'small' } },
        MuiPaper: { styleOverrides: { rounded: { borderRadius: 16 } } },
        MuiTooltip: { defaultProps: { arrow: true } },
        MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    },
};

export const buildTheme = (mode = 'light') =>
    createTheme({
        ...baseTokens,
        palette: {
            mode,
            primary: { main: '#4f46e5', dark: '#4338ca', light: '#818cf8', contrastText: '#fff' },
            secondary: { main: '#0ea5e9', contrastText: '#fff' },
            success: { main: '#16a34a' },
            warning: { main: '#d97706' },
            error: { main: '#dc2626' },
            ...(mode === 'light'
                ? {
                      background: { default: '#f6f8fc', paper: '#ffffff' },
                      text: { primary: '#0f172a', secondary: '#475569' },
                      divider: '#e2e8f0',
                  }
                : {
                      background: { default: '#0b1120', paper: '#111827' },
                      text: { primary: '#e2e8f0', secondary: '#94a3b8' },
                      divider: '#1f2937',
                  }),
        },
    });

export default buildTheme('light');

