export interface Article {
    id: string;
    userId: string;
    categoryId: string;
    title: string;
    content: string;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
    category: {
        id: string;
        userId: string;
        name: string;
        createdAt: string;
        updatedAt: string;
    };
    user: {
        id: string;
        username: string;
    };
}

export const dummyArticles: Article[] = [
    {
        "id": "3bf659d9-b0fc-411c-957a-f8549f529f22",
        "userId": "101e8be1-9357-49a7-9184-04a3cd65deac",
        "categoryId": "b66711e7-8208-40c8-95c2-7a9f9b550c24",
        "title": "Transportasi Umum Modern",
        "content": "\u003Cp\u003ETransportasi ini digunakan untuk mengakut sapi dan kerbau dengan teknologi modern yang memastikan kesejahteraan hewan selama pengangkutan. Sistem ini dikembangkan dengan memperhatikan kenyamanan hewan ternak dan efisiensi pengangkutan.\u003C/p\u003E",
        "imageUrl": null,
        "createdAt": "2025-05-10T17:38:44.260Z",
        "updatedAt": "2025-05-10T17:38:44.260Z",
        "category": {
            "id": "b66711e7-8208-40c8-95c2-7a9f9b550c24",
            "userId": "7889fea3-658e-4234-a679-f85c5cb14e2e",
            "name": "Transportasi Udara",
            "createdAt": "2025-05-09T10:02:33.358Z",
            "updatedAt": "2025-05-10T19:59:06.232Z"
        },
        "user": {
            "id": "101e8be1-9357-49a7-9184-04a3cd65deac",
            "username": "Harry Maguire"
        }
    },
    {
        "id": "8e3f61d3-61ab-4624-b847-bb30420ca757",
        "userId": "ae9f3927-2996-43fe-a8d5-0116c40b5642",
        "categoryId": "8f41cf75-30cf-4c3b-b7f4-fa9b68da2a37",
        "title": "Geology is Best: The Science of Earth",
        "content": "\u003Cp\u003EGeology provides fascinating insights into the formation and evolution of our planet. From continental drift to volcanic activity, understanding geological processes helps us predict natural disasters and locate valuable resources. This article explores the fundamental concepts of geology and why it remains one of the most important earth sciences today.\u003C/p\u003E",
        "imageUrl": null,
        "createdAt": "2025-05-10T09:58:56.129Z",
        "updatedAt": "2025-05-10T09:58:56.129Z",
        "category": {
            "id": "8f41cf75-30cf-4c3b-b7f4-fa9b68da2a37",
            "userId": "c2cfd62c-132c-4494-8887-683b344524d0",
            "name": "Finance",
            "createdAt": "2025-05-10T05:48:22.265Z",
            "updatedAt": "2025-05-10T05:48:22.265Z"
        },
        "user": {
            "id": "ae9f3927-2996-43fe-a8d5-0116c40b5642",
            "username": "Cristiano"
        }
    },
    {
        "id": "8ed3ce4c-9701-44ce-a279-7796128a4788",
        "userId": "ae9f3927-2996-43fe-a8d5-0116c40b5642",
        "categoryId": "9155d16b-fe6b-4056-b0d4-82104a4c6539",
        "title": "Teknologi Terbaru 2025",
        "content": "\u003Cp\u003ETeknologi terus berkembang pesat di tahun 2025. Penemuan-penemuan terbaru di bidang kecerdasan buatan dan komputasi kuantum telah membuka jalan bagi inovasi yang belum pernah terjadi sebelumnya. Artikel ini membahas tren terkini dan bagaimana teknologi-teknologi ini akan mempengaruhi masa depan kita.\u003C/p\u003E",
        "imageUrl": null,
        "createdAt": "2025-05-10T01:06:49.409Z",
        "updatedAt": "2025-05-10T01:06:49.409Z",
        "category": {
            "id": "9155d16b-fe6b-4056-b0d4-82104a4c6539",
            "userId": "cc98b87a-5129-4ee5-bc8d-69f2a6c24fcb",
            "name": "Technology",
            "createdAt": "2025-05-09T15:17:44.850Z",
            "updatedAt": "2025-05-09T15:17:44.850Z"
        },
        "user": {
            "id": "ae9f3927-2996-43fe-a8d5-0116c40b5642",
            "username": "Cristiano"
        }
    },
    {
        "id": "be629e20-5353-419c-a6ac-990460cc78da",
        "userId": "c2cfd62c-132c-4494-8887-683b344524d0",
        "categoryId": "9155d16b-fe6b-4056-b0d4-82104a4c6539",
        "title": "Perkembangan BlockChain di IoT",
        "content": "\u003Cp\u003EIntegrasi blockchain dengan Internet of Things (IoT) membuka peluang baru untuk keamanan data dan transparansi. Teknologi ini memungkinkan perangkat IoT untuk berkomunikasi dan melakukan transaksi secara aman tanpa memerlukan otoritas pusat. Artikel ini membahas implementasi terkini dan potensi masa depan dari perpaduan dua teknologi revolusioner ini.\u003C/p\u003E",
        "imageUrl": "https://s3.sellerpintar.com/articles/articles/1746880803358-IMG-20250417-WA0006.jpg",
        "createdAt": "2025-05-10T12:40:03.553Z",
        "updatedAt": "2025-05-10T12:40:03.553Z",
        "category": {
            "id": "9155d16b-fe6b-4056-b0d4-82104a4c6539",
            "userId": "cc98b87a-5129-4ee5-bc8d-69f2a6c24fcb",
            "name": "Technology",
            "createdAt": "2025-05-09T15:17:44.850Z",
            "updatedAt": "2025-05-09T15:17:44.850Z"
        },
        "user": {
            "id": "c2cfd62c-132c-4494-8887-683b344524d0",
            "username": "Haikal"
        }
    },
    {
        "id": "c0add3d8-4455-4079-b3f1-e8add59e79c9",
        "userId": "d80e40ed-9236-49d8-b4b8-d6f1ffaae868",
        "categoryId": "9155d16b-fe6b-4056-b0d4-82104a4c6539",
        "title": "Blockchain Makes Good: Transforming Industries",
        "content": "\u003Cp\u003EBlockchain technology is revolutionizing various industries beyond cryptocurrency. From supply chain management to healthcare records, blockchain provides secure, transparent, and immutable record-keeping systems. This article explores how different sectors are implementing blockchain solutions and the benefits they're experiencing.\u003C/p\u003E",
        "imageUrl": "https://s3.sellerpintar.com/articles/articles/1746865415981-Image-header-articles.jpg",
        "createdAt": "2025-05-09T18:45:38.636Z",
        "updatedAt": "2025-05-10T08:23:36.198Z",
        "category": {
            "id": "9155d16b-fe6b-4056-b0d4-82104a4c6539",
            "userId": "cc98b87a-5129-4ee5-bc8d-69f2a6c24fcb",
            "name": "Technology",
            "createdAt": "2025-05-09T15:17:44.850Z",
            "updatedAt": "2025-05-09T15:17:44.850Z"
        },
        "user": {
            "id": "d80e40ed-9236-49d8-b4b8-d6f1ffaae868",
            "username": "Admin Tech"
        }
    },
    {
        "id": "c3addd76-6549-4016-b8c6-2b1e52d9d097",
        "userId": "d80e40ed-9236-49d8-b4b8-d6f1ffaae868",
        "categoryId": "b66711e7-8208-40c8-95c2-7a9f9b550c24",
        "title": "Transportasi Umum di Era Digital",
        "content": "\u003Cp\u003ESistem transportasi umum saat ini telah mengalami transformasi digital yang signifikan. Aplikasi pemesanan tiket, pelacakan real-time, dan sistem pembayaran elektronik membuat perjalanan menjadi lebih efisien dan nyaman. Artikel ini mengulas inovasi terbaru dalam transportasi umum dan bagaimana teknologi digital meningkatkan pengalaman pengguna.\u003C/p\u003E",
        "imageUrl": null,
        "createdAt": "2025-05-10T03:08:42.976Z",
        "updatedAt": "2025-05-10T03:08:42.976Z",
        "category": {
            "id": "b66711e7-8208-40c8-95c2-7a9f9b550c24",
            "userId": "7889fea3-658e-4234-a679-f85c5cb14e2e",
            "name": "Transportasi Udara",
            "createdAt": "2025-05-09T10:02:33.358Z",
            "updatedAt": "2025-05-10T19:59:06.232Z"
        },
        "user": {
            "id": "d80e40ed-9236-49d8-b4b8-d6f1ffaae868",
            "username": "Admin Tech"
        }
    },
    {
        "id": "1ba4ace7-41f8-45db-a364-dc890b9f51dc",
        "userId": "759d1f32-5192-4aba-99c9-57f9b811e584",
        "categoryId": "8f41cf75-30cf-4c3b-b7f4-fa9b68da2a37",
        "title": "fake",
        "content": "Create a beautiful blog that fits your style. Choose from a selection of easy-to-use templates – all with flexible layouts and hundreds of background images – or design something new. ",
        "imageUrl": null,
        "createdAt": "2025-05-11T11:04:01.289Z",
        "updatedAt": "2025-05-11T11:04:01.289Z",
        "category": {
            "id": "8f41cf75-30cf-4c3b-b7f4-fa9b68da2a37",
            "userId": "c2cfd62c-132c-4494-8887-683b344524d0",
            "name": "Finance",
            "createdAt": "2025-05-10T05:48:22.265Z",
            "updatedAt": "2025-05-10T05:48:22.265Z"
        },
        "user": {
            "id": "759d1f32-5192-4aba-99c9-57f9b811e584",
            "username": "ipsum admin"
        }
    },
    {
        "id": "38b70113-60d8-42b3-9c52-5e8222f7cce3",
        "userId": "759d1f32-5192-4aba-99c9-57f9b811e584",
        "categoryId": "9155d16b-fe6b-4056-b0d4-82104a4c6539",
        "title": "tshirt",
        "content": "Create a beautiful blog that fits your style. Choose from a selection of easy-to-use templates – all with flexible layouts and hundreds of background images – or design something new. ",
        "imageUrl": null,
        "createdAt": "2025-05-11T11:04:53.558Z",
        "updatedAt": "2025-05-11T11:04:53.558Z",
        "category": {
            "id": "9155d16b-fe6b-4056-b0d4-82104a4c6539",
            "userId": "cc98b87a-5129-4ee5-bc8d-69f2a6c24fcb",
            "name": "Technology",
            "createdAt": "2025-05-09T15:17:44.850Z",
            "updatedAt": "2025-05-09T15:17:44.850Z"
        },
        "user": {
            "id": "759d1f32-5192-4aba-99c9-57f9b811e584",
            "username": "ipsum admin"
        }
    },
];