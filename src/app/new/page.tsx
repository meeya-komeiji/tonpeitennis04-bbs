'use client';

import Container from '@mui/material/Container';
import Header from '@/components/Header';
import Panel from '@/components/Panel';
import NewThreadForm from '@/components/NewThreadForm';

export default function NewThreadPage() {
  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Header />
      <Panel>
        <NewThreadForm />
      </Panel>
    </Container>
  );
}
