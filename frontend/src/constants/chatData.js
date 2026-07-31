// Mock Database for NexCart C2C Buyer-Seller Messaging Module

export const INITIAL_CONVERSATIONS = [
  {
    id: "conv-1",
    partner: {
      id: "usr-101",
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
      role: "Seller",
      rating: 4.9,
      reviewCount: 38,
      verified: true,
      online: true,
      lastSeen: "Online now",
      location: "Downtown, Metro City"
    },
    product: {
      id: "prod-101",
      title: "Apple iPhone 15 Pro 256GB - Natural Titanium (Like New)",
      price: 950,
      originalPrice: 1099,
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&q=80",
      category: "Mobiles",
      condition: "Like New (1 month old)",
      status: "Available"
    },
    unreadCount: 2,
    lastMessageTimestamp: "10:42 AM",
    messages: [
      {
        id: "msg-101-1",
        senderId: "current-user",
        text: "Hi Alex! Is this iPhone 15 Pro still available?",
        timestamp: "Yesterday, 4:15 PM",
        status: "read",
        type: "text"
      },
      {
        id: "msg-101-2",
        senderId: "usr-101",
        text: "Hey! Yes, it's still available. Includes original box, cable, and battery status is 100%.",
        timestamp: "Yesterday, 4:18 PM",
        status: "read",
        type: "text"
      },
      {
        id: "msg-101-3",
        senderId: "current-user",
        text: "Awesome! Would you consider taking $900 for a quick cash pickup today?",
        timestamp: "Yesterday, 4:22 PM",
        status: "read",
        type: "text"
      },
      {
        id: "msg-101-4",
        senderId: "usr-101",
        type: "offer",
        offerDetails: {
          id: "off-900",
          amount: 900,
          originalPrice: 950,
          status: "pending",
          proposedBy: "current-user"
        },
        text: "Submitted a price offer of $900.00",
        timestamp: "10:30 AM",
        status: "read"
      },
      {
        id: "msg-101-5",
        senderId: "usr-101",
        text: "I can accept $915! That's a fair price considering it has AppleCare+ active.",
        timestamp: "10:40 AM",
        status: "unread",
        type: "text"
      },
      {
        id: "msg-101-6",
        senderId: "usr-101",
        text: "Let me know if you want to meet at Central Mall plaza.",
        timestamp: "10:42 AM",
        status: "unread",
        type: "text"
      }
    ]
  },
  {
    id: "conv-2",
    partner: {
      id: "usr-102",
      name: "Sophia Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
      role: "Buyer",
      rating: 5.0,
      reviewCount: 14,
      verified: true,
      online: true,
      lastSeen: "Online now",
      location: "North Suburbs"
    },
    product: {
      id: "prod-102",
      title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
      price: 280,
      originalPrice: 399,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80",
      category: "Electronics",
      condition: "Mint in Box",
      status: "Available"
    },
    unreadCount: 1,
    lastMessageTimestamp: "09:15 AM",
    messages: [
      {
        id: "msg-102-1",
        senderId: "usr-102",
        text: "Hello! Are the headphones under warranty?",
        timestamp: "09:10 AM",
        status: "read",
        type: "text"
      },
      {
        id: "msg-102-2",
        senderId: "usr-102",
        text: "Can we schedule a meetup somewhere near Tech Park station?",
        timestamp: "09:15 AM",
        status: "unread",
        type: "text"
      }
    ]
  },
  {
    id: "conv-3",
    partner: {
      id: "usr-103",
      name: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
      role: "Seller",
      rating: 4.8,
      reviewCount: 92,
      verified: true,
      online: false,
      lastSeen: "Active 15m ago",
      location: "Financial District"
    },
    product: {
      id: "prod-103",
      title: "MacBook Pro 16\" M3 Max (36GB RAM, 1TB SSD)",
      price: 2400,
      originalPrice: 2899,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80",
      category: "Laptops",
      condition: "Brand New Sealed",
      status: "Offer Accepted"
    },
    unreadCount: 0,
    lastMessageTimestamp: "Yesterday",
    messages: [
      {
        id: "msg-103-1",
        senderId: "current-user",
        text: "Hi Marcus! I am interested in the M3 Max MacBook Pro.",
        timestamp: "Yesterday, 2:00 PM",
        status: "read",
        type: "text"
      },
      {
        id: "msg-103-2",
        senderId: "usr-103",
        text: "Hello! It's brand new factory sealed with receipt.",
        timestamp: "Yesterday, 2:05 PM",
        status: "read",
        type: "text"
      },
      {
        id: "msg-103-3",
        senderId: "current-user",
        type: "offer",
        offerDetails: {
          id: "off-2350",
          amount: 2350,
          originalPrice: 2400,
          status: "accepted",
          proposedBy: "current-user"
        },
        text: "Offer of $2,350.00 Accepted!",
        timestamp: "Yesterday, 2:30 PM",
        status: "read"
      },
      {
        id: "msg-103-4",
        senderId: "usr-103",
        type: "meetup",
        meetupDetails: {
          date: "Tomorrow (Aug 1)",
          time: "02:00 PM",
          location: "Starbucks @ Financial Center Mall",
          status: "confirmed"
        },
        text: "Scheduled Meetup: Aug 1 at 2:00 PM",
        timestamp: "Yesterday, 2:35 PM",
        status: "read"
      }
    ]
  },
  {
    id: "conv-4",
    partner: {
      id: "usr-104",
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80",
      role: "Buyer",
      rating: 4.7,
      reviewCount: 21,
      verified: false,
      online: false,
      lastSeen: "Active 2h ago",
      location: "West End"
    },
    product: {
      id: "prod-104",
      title: "Nike Air Jordan 1 Retro High OG - Size 10 (Original)",
      price: 190,
      originalPrice: 220,
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300&q=80",
      category: "Fashion",
      condition: "Used - Like New",
      status: "Available"
    },
    unreadCount: 0,
    lastMessageTimestamp: "Jul 29",
    messages: [
      {
        id: "msg-104-1",
        senderId: "usr-104",
        text: "Hi! Are these authentic Jordans?",
        timestamp: "Jul 29, 11:00 AM",
        status: "read",
        type: "text"
      },
      {
        id: "msg-104-2",
        senderId: "current-user",
        text: "Yes 100% authentic, bought from SNKRS app. Can show proof of purchase.",
        timestamp: "Jul 29, 11:15 AM",
        status: "read",
        type: "text"
      },
      {
        id: "msg-104-3",
        senderId: "current-user",
        type: "location",
        locationDetails: {
          title: "Safe Meetup Spot: Westside Police Station Public Zone",
          address: "450 Commerce Ave, West End",
          coords: "37.7749, -122.4194"
        },
        text: "Shared Location: Westside Police Station Public Zone",
        timestamp: "Jul 29, 11:20 AM",
        status: "read"
      }
    ]
  },
  {
    id: "conv-5",
    partner: {
      id: "usr-105",
      name: "TechVault Store",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&q=80",
      role: "Seller",
      rating: 5.0,
      reviewCount: 412,
      verified: true,
      online: true,
      lastSeen: "Online now",
      location: "Verified NexCart Outlet"
    },
    product: {
      id: "prod-105",
      title: "Custom Gaming PC i7 14700K / RTX 4080 Super / 32GB RGB",
      price: 1850,
      originalPrice: 2199,
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300&q=80",
      category: "Electronics",
      condition: "Brand New",
      status: "In Stock"
    },
    unreadCount: 0,
    lastMessageTimestamp: "Jul 27",
    messages: [
      {
        id: "msg-105-1",
        senderId: "current-user",
        text: "Does this gaming build come with a 2-year warranty?",
        timestamp: "Jul 27, 3:00 PM",
        status: "read",
        type: "text"
      },
      {
        id: "msg-105-2",
        senderId: "usr-105",
        text: "Hello! Yes, all TechVault custom builds come with 2-year full hardware warranty & free testing.",
        timestamp: "Jul 27, 3:02 PM",
        status: "read",
        type: "text"
      }
    ]
  }
];

export const AI_QUICK_REPLIES = [
  "Is this still available?",
  "Can you negotiate?",
  "Where can we meet?",
  "I'll buy it."
];

export const SAFE_MEETUP_SPOTS = [
  "City Central Metro Station (Main Lobby)",
  "NexCart Safe Exchange Zone - Downtown Hub",
  "Grand Mall Security Center",
  "Local Police Station Public Parking",
  "Starbucks Community Lounge, Financial District"
];
