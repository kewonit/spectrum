import { Metadata, ResolvingMetadata } from 'next';
import { RegisterComponent } from './components/RegisterComponent';
import { fetchApi } from "@/app/utils/api";

async function getEventDetails(eventName: string) {
  try {
    const res = await fetchApi(`/api/events/details?name=${encodeURIComponent(eventName)}`, {
      cache: 'no-store'
    });
    
    if (res.status === 404) return null;
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching event details:', error);
    return null;
  }
}

type Props = {
  params: Promise<{ "event-name": string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const eventName = params["event-name"];
  const details = await getEventDetails(eventName);

  if (!details) {
    return {
      title: 'Event Not Found'
    };
  }

  return {
    title: `Register for ${details.name} | Spectrum`,
    description: details.description || `Register for ${details.name} at Spectrum`,
  };
}

export default async function RegisterPage(props: Props) {
  const params = await props.params;
  const eventName = params["event-name"];
  const eventDetails = await getEventDetails(eventName);

  if (!eventDetails) {
    return null;
  }

  return <RegisterComponent eventDetails={eventDetails} />;
}