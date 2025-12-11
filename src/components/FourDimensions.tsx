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
    <section id="four-dimensions" className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-[#D4A84B] text-sm font-semibold uppercase tracking-wider">
            THE METHODOLOGY
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#2D2D2D]">
            Four dimensions,<br />
            <span className="font-normal text-[#2D2D2D]/60">one unified profile</span>
          </h2>
        </div>

        {/* Dimensions list */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {dimensions.map((dim, index) => (
            <div 
              key={index}
              className="flex items-start gap-6 p-6 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {/* Number */}
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: dim.color }}
              >
                {dim.number}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-[#2D2D2D]">{dim.title}</h3>
                  <span className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wider">
                    {dim.subtitle}
                  </span>
                </div>
                <p className="text-[#2D2D2D]/70 leading-relaxed">
                  {dim.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Integration banner */}
        <div className="mt-16 bg-[#0D5C5C] rounded-2xl p-8 md:p-12 text-center">
          <p className="text-white text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
            All four assessments integrate <span className="font-bold">seamlessly</span><br />
            to create your <span className="font-bold">comprehensive leadership profile</span>
          </p>
          <p className="text-white mt-4 text-sm">
            A unified, actionable roadmap tailored specifically to you.
          </p>
        </div>
      </div>
    </section>
  );
}
