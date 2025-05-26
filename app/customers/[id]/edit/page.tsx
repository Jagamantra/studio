'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { CustomerFormClient } from '../../form/CustomerFormClient';
import * as Api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function EditCustomerPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      notFound(); // Still supported for now
    }

    const fetchCustomer = async () => {
      try {
        const data = await Api.getCustomerById(id);
        setCustomer(data);
      } catch (error: any) {
        console.error('Error loading customer:', error);
        if (error?.response?.status === 404) {
          notFound();
        } else {
          toast({ type: 'error', message: 'Failed to load customer' });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!customer) return <p>Customer not found</p>;

  return (
    <CustomerFormClient
      mode="edit"
      customerId={id}
      initialData={customer}
    />
  );
}
