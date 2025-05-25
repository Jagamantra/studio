import { CustomerFormClient } from '../../form/CustomerFormClient';

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  return <CustomerFormClient mode="edit" customerId={params.id} />;
}
