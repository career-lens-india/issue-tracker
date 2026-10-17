export default function LoadingMessage({ text = 'Loading...' }) {
  return <p className="state-message loading">{text}</p>;
}
