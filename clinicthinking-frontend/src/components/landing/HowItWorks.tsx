export default function HowItWorks() {
  const steps = ["Pilih Kasus", "Interaksi AI", "Analisis Peta", "Terima Feedback"];
  return (
    <section className="py-20 text-center">
      <h2 className="text-4xl font-bold mb-12">How It Works</h2>
      <div className="flex flex-wrap justify-center gap-8">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center w-40">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500 flex items-center justify-center mb-4 text-xl">
              {i + 1}
            </div>
            <p>{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}