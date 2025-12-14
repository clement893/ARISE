export default function FourDimensions() {
  const dimensions = [
    {
      number: "01",
      title: "MBTI",
      subtitle: "PERSONALITY TYPE",
      description: "Understand your inherent preferences and leverage your natural strengths through comprehensive personality typing.",
      color: "#D4A84B"
    },
    {
      number: "02",
      title: "TKI",
      subtitle: "CONFLICT MANAGEMENT",
      description: "Discover your conflict-handling modes and learn to navigate challenging situations with positivity and skill.",
      color: "#7A9A8E"
    },
    {
      number: "03",
      title: "360° Feedback",
      subtitle: "MULTI-PERSPECTIVE",
      description: "Gain comprehensive feedback from peers, managers, and direct reports to identify blind spots and validate strengths.",
      color: "#D4856A"
    },
    {
      number: "04",
      title: "WELLNESS",
      subtitle: "HOLISTIC WELL-BEING",
      description: "Assess physical, mental, and emotional health dimensions to create peak performance and personal balance.",
      color: "#0D5C5C"
    }
  ];

  return (
    <section id="four-dimensions" className="bg-[#0d5a5a] py-12 sm:py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <span className="text-[#c9a961] text-xs sm:text-sm font-semibold uppercase tracking-[2px] block mb-3 sm:mb-4">
            THE METHODOLOGY
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Four dimensions, one unified profile
          </h2>
        </div>

        {/* Dimensions list */}
        <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
          {dimensions.map((dim, index) => (
            <div 
              key={index}
              className="flex items-start gap-4 sm:gap-6 md:gap-8 border-l-4 border-[#c9a961] pl-6 sm:pl-8 md:pl-12 py-4"
            >
              {/* Number */}
              <div 
                className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center font-bold text-xl sm:text-2xl"
                style={{ 
                  backgroundColor: '#0d7a7a',
                  color: '#c9a961'
                }}
              >
                {dim.number}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">
                  {dim.title}
                </h3>
                <span className="text-xs sm:text-sm font-semibold text-[#e0e0e0] uppercase tracking-[1px] block mb-2 sm:mb-3">
                  {dim.subtitle}
                </span>
                <p className="text-sm sm:text-base text-white leading-relaxed">
                  {dim.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Integration summary */}
        <div className="mt-8 sm:mt-12 md:mt-16 bg-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center">
          <p className="text-white text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
            All four assessments integrate <strong className="text-[#c9a961] font-bold">seamlessly</strong> to create your comprehensive leadership profile
          </p>
        </div>
      </div>
    </section>
  );
}
