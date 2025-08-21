import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "@/contexts/ThemeContext";

const useHighlight = () => {
    const { theme } = useTheme();
    return theme === 'dark' ? oneDark : oneLight;
};

export default useHighlight;