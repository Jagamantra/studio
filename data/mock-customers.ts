import { Customer } from "@/types";

export const mockCustomers: Customer[] = [
  {
    id: "1",
    companyName: "Acme Corporation",
    address: "123 Elm Street, Springfield, IL 62704",
    phoneNumber: "+1-217-555-0123",
    email: "contact@acmecorp.com",
    website: "https://www.acmecorp.com",
    kvkNumber: "12345678",
    legalForm: "B.V.",
    mainActivity: "Manufacturing of industrial equipment",
    sideActivities: "Logistics and distribution",
    dga: "John Doe",
    staffFTE: 150,
    annualTurnover: 12500000,
    grossProfit: 4500000,
    payrollYear: 2024,
    description: "Leading manufacturer in industrial equipment sector with global reach.",

    visitDate: "2024-04-15T09:00:00Z",
    advisor: "Sarah Smith",
    visitLocation: "Acme Headquarters, Springfield",
    visitFrequency: "Quarterly",
    conversationPartner: "John Doe, CFO",

    comments: "Discussed potential for expanding product line and improving supply chain.",
    
    updatedAt: "2024-05-20T10:30:00Z",
    status: "in-progress",
  },

  {
    id: "2",
    companyName: "TechStart Inc",
    address: "456 Maple Avenue, San Francisco, CA 94107",
    phoneNumber: "+1-415-555-9876",
    email: "info@techstart.com",
    website: "https://www.techstart.com",
    kvkNumber: "87654321",
    legalForm: "N.V.",
    mainActivity: "Software development and IT services",
    sideActivities: "Cloud hosting and consulting",
    dga: "Jane Smith",
    staffFTE: 85,
    annualTurnover: 8500000,
    grossProfit: 3200000,
    payrollYear: 2024,
    description: "Innovative software company specializing in cloud solutions and SaaS products.",

    visitDate: "2024-03-22T13:30:00Z",
    advisor: "Mike Johnson",
    visitLocation: "TechStart Office, San Francisco",
    visitFrequency: "Monthly",
    conversationPartner: "Jane Smith, CEO",

    comments: "Explored integration options for new client management software.",
    
    updatedAt: "2024-05-19T14:20:00Z",
    status: "on-hold",
  },

  {
    id: "3",
    companyName: "Global Solutions Ltd",
    address: "789 Oak Road, London, UK SW1A 1AA",
    phoneNumber: "+44-20-7946-0123",
    email: "contact@globalsolutions.co.uk",
    website: "https://www.globalsolutions.co.uk",
    kvkNumber: "11223344",
    legalForm: "Ltd.",
    mainActivity: "International logistics and freight forwarding",
    sideActivities: "Customs brokerage",
    dga: "Robert Brown",
    staffFTE: 250,
    annualTurnover: 23000000,
    grossProfit: 9000000,
    payrollYear: 2024,
    description: "Global logistics company specializing in freight and customs services worldwide.",

    visitDate: "2024-02-10T11:00:00Z",
    advisor: "Emily Davis",
    visitLocation: "Global Solutions HQ, London",
    visitFrequency: "Biannually",
    conversationPartner: "Robert Brown, Managing Director",

    comments: "Reviewed contract renewal terms and new market expansion plans.",
    
    updatedAt: "2024-05-18T09:15:00Z",
    status: "completed",
  },
];
