import TextType from "./TextType";

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-0 pointer-events-none">
      <TextType
        text={[
            "HexaHub",
            "Collaborative\nIDE",
            "Real-time Code\nEditing",
            "Code Editor",
            "Run and Debug\nCode",
            "Syntax Highlighting",
            "Team\nCollaboration",
            "AI Code Suggestions",
            "Multi-Language Support",
        ]}
        as="span"
        className="absolute text-[8rem] md:text-[10rem] font-thin opacity-20 select-none"
        typingSpeed={80}
        deletingSpeed={50}
        pauseDuration={3000}
        loop
        fontFamily="'BitcountPropDoubleInk', sans-serif"
      />
    </div>
  );
}
