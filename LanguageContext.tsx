Linting and checking validity of types ...
Failed to compile.
./AboutScreen.tsx:12:14
Type error: Property 'isRTL' does not exist on type 'LanguageContextType'.
  10 |
  11 | export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
> 12 |   const { t, isRTL } = useLanguage();
     |              ^
  13 |
  14 |   return (
  15 |     <div className="flex flex-col h-full min-h-screen bg-[#E65100] dark:bg-zinc-950 text-black dark:text-white transition-colors duration-500">
Next.js build worker exited with code: 1 and signal: null
Error: Command "npm run build" exited with 1
