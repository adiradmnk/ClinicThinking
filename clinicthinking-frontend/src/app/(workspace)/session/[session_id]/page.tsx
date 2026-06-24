import WhiteboardContainer from './components/WhiteboardContainer';

export default function SessionPage({ params }: { params: { session_id: string } }) {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Sesi OSCE: {params.session_id}</h1>
      <WhiteboardContainer sessionId={params.session_id} />
    </main>
  );
}