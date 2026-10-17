/**
 * Instructor-led mini-demo (not mounted in SprintBoard).
 * Teaches Unit IV: initial state, updates, async initialization, and events.
 *
 * Students can scaffold with: npm create vite@latest counter-demo -- --template react
 */
import { useEffect, useState } from 'react';

export default function CounterDemo() {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return <p>Loading counter…</p>;
  }

  return (
    <section>
      <h2>Counter: {count}</h2>
      <button type="button" onClick={() => setCount((c) => c - 1)}>Decrement</button>
      <button type="button" onClick={() => setCount((c) => c + 1)}>Increment</button>
      <button type="button" onClick={() => setCount((c) => c * 2)}>Double</button>
      <button type="button" onClick={() => setCount(0)}>Reset</button>
    </section>
  );
}
