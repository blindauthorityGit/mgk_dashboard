export default {
  name: 'booking',
  title: 'Booking',
  type: 'document',
  fields: [
    {
      name: 'date',
      title: 'Date',
      type: 'string',
      description: 'The date of the booking in ISO 8601 format, e.g., "2024-02-29T00:00:00.000Z".',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      description: 'The email address of the person making the booking.',
    },
    {
      name: 'guests',
      title: 'Guests',
      type: 'string',
      description: 'The number of guests, as a string.',
    },
    {
      name: 'kids',
      title: 'Kids',
      type: 'string',
      description: 'The number of kids, as a string.',
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'The full name of the person making the booking.',
    },
    {
      name: 'telefon',
      title: 'Telefon',
      type: 'string',
      description: 'The telephone number of the person making the booking.',
    },
    {
      name: 'timeSlot',
      title: 'Time Slot',
      type: 'string',
      description: 'The booked time slot, e.g., "09:30".',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'date',
    },
  },
}
