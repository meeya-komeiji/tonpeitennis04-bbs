import { Suspense } from 'react';
import ThreadView from './ThreadView';

export default function ThreadPage() {
  return (
    <Suspense fallback={null}>
      <ThreadView />
    </Suspense>
  );
}
