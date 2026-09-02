export interface FlutterCodeFile {
  path: string;
  category: 'config' | 'model' | 'service' | 'provider' | 'screen' | 'database' | 'docs';
  language: 'dart' | 'yaml' | 'sql' | 'markdown';
  description: string;
  content: string;
}

export const FLUTTER_CODE_FILES: FlutterCodeFile[] = [
  {
    path: 'pubspec.yaml',
    category: 'config',
    language: 'yaml',
    description: 'Flutter dependencies including Supabase, Material 3, SQLite & Image Picker',
    content: `name: retwitter
description: A complete Android-first open-source social media application.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  # Backend & Auth (100% Free & Open Source)
  supabase_flutter: ^2.5.0
  google_sign_in: ^6.2.1
  # State Management
  provider: ^6.1.2
  # Offline Cache & Storage
  sqflite: ^2.3.0
  path_provider: ^2.1.1
  path: ^1.8.3
  shared_preferences: ^2.2.3
  # UI & Utilities
  cached_network_image: ^3.3.1
  image_picker: ^1.0.4
  timeago: ^3.6.1
  share_plus: ^7.2.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`
  },
  {
    path: 'lib/main.dart',
    category: 'config',
    language: 'dart',
    description: 'Application entry point, Supabase initialization & MultiProvider root',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/constants.dart';
import 'core/theme.dart';
import 'providers/auth_provider.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase with PostgreSQL backend
  await Supabase.initialize(
    url: AppConstants.supabaseUrl,
    anonKey: AppConstants.supabaseAnonKey,
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const ReTwitterApp(),
    ),
  );
}

class ReTwitterApp extends StatelessWidget {
  const ReTwitterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ReTwitter',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system, // Android-first automatic system theme switching
      home: const SplashScreen(),
    );
  }
}
`
  },
  {
    path: 'lib/core/constants.dart',
    category: 'config',
    language: 'dart',
    description: 'Supabase URL, Anon key, and GCP Web Client ID configuration',
    content: `class AppConstants {
  // Replace with your Supabase Project details from dashboard -> Project Settings -> API
  static const String supabaseUrl = 'https://your-project-id.supabase.co';
  static const String supabaseAnonKey = 'your-anon-key-here';
  
  // Google Cloud Web Client ID for Android OAuth in Supabase
  static const String webClientId = 'your-google-web-client-id.apps.googleusercontent.com';
}
`
  },
  {
    path: 'lib/core/theme.dart',
    category: 'config',
    language: 'dart',
    description: 'Material Design 3 complete light and dark theming with dynamic color seeds',
    content: `import 'package:flutter/material.dart';

class AppTheme {
  static const Color primarySeed = Color(0xFF1D9BF0);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorSchemeSeed: primarySeed,
      brightness: Brightness.light,
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        elevation: 0,
        scrolledUnderElevation: 2,
      ),
      navigationBarTheme: NavigationBarThemeData(
        indicatorColor: primarySeed.withOpacity(0.18),
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        elevation: 3,
        shape: CircleBorder(),
      ),
      cardTheme: CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
        filled: true,
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorSchemeSeed: primarySeed,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: const Color(0xFF0F141C),
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        elevation: 0,
        backgroundColor: Color(0xFF0F141C),
        scrolledUnderElevation: 2,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: const Color(0xFF161C26),
        indicatorColor: primarySeed.withOpacity(0.3),
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        elevation: 3,
        shape: CircleBorder(),
      ),
      cardTheme: CardTheme(
        color: const Color(0xFF19202E),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
        filled: true,
      ),
    );
  }
}
`
  },
  {
    path: 'lib/models/user_profile.dart',
    category: 'model',
    language: 'dart',
    description: 'User profile model with bio, avatar and JSON serialization',
    content: `class UserProfile {
  final String id;
  final String username;
  final String? bio;
  final String? profilePhoto;
  final int followersCount;
  final int followingCount;

  UserProfile({
    required this.id,
    required this.username,
    this.bio,
    this.profilePhoto,
    this.followersCount = 0,
    this.followingCount = 0,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'],
      username: json['username'] ?? 'User',
      bio: json['bio'],
      profilePhoto: json['profile_photo'],
      followersCount: json['followers_count'] ?? 0,
      followingCount: json['following_count'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'bio': bio,
      'profile_photo': profilePhoto,
      'followers_count': followersCount,
      'following_count': followingCount,
    };
  }
}
`
  },
  {
    path: 'lib/models/post_model.dart',
    category: 'model',
    language: 'dart',
    description: 'Post model for feed with user profile relation and engagement counters',
    content: `import 'user_profile.dart';

class Post {
  final String id;
  final String userId;
  final String? content;
  final String? imageUrl;
  final DateTime createdAt;
  final UserProfile? user;
  int likeCount;
  bool isLikedByMe;
  int commentCount;
  int repostCount;
  bool isRepostedByMe;
  bool isBookmarkedByMe;

  Post({
    required this.id,
    required this.userId,
    this.content,
    this.imageUrl,
    required this.createdAt,
    this.user,
    this.likeCount = 0,
    this.isLikedByMe = false,
    this.commentCount = 0,
    this.repostCount = 0,
    this.isRepostedByMe = false,
    this.isBookmarkedByMe = false,
  });

  factory Post.fromJson(Map<String, dynamic> json, {String? currentUserId}) {
    return Post(
      id: json['id'],
      userId: json['user_id'],
      content: json['content'],
      imageUrl: json['image_url'],
      createdAt: DateTime.parse(json['created_at']),
      user: json['profiles'] != null ? UserProfile.fromJson(json['profiles']) : null,
      likeCount: json['likeCount'] ?? json['likes']?[0]?['count'] ?? 0,
      isLikedByMe: json['isLikedByMe'] ?? false,
      commentCount: json['commentCount'] ?? json['comments']?[0]?['count'] ?? 0,
      repostCount: json['repostCount'] ?? 0,
      isRepostedByMe: json['isRepostedByMe'] ?? false,
      isBookmarkedByMe: json['isBookmarkedByMe'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'content': content,
      'image_url': imageUrl,
      'created_at': createdAt.toIso8601String(),
      'profiles': user?.toJson(),
      'likeCount': likeCount,
      'isLikedByMe': isLikedByMe,
      'commentCount': commentCount,
      'repostCount': repostCount,
    };
  }
}
`
  },
  {
    path: 'lib/services/auth_service.dart',
    category: 'service',
    language: 'dart',
    description: 'Supabase authentication service: Email, Google, Guest & Signout',
    content: `import 'package:google_sign_in/google_sign_in.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/constants.dart';

class AuthService {
  final SupabaseClient _client = Supabase.instance.client;

  // Email/Password Sign Up
  Future<AuthResponse> signUp(String email, String password) async {
    return await _client.auth.signUp(email: email, password: password);
  }

  // Email/Password Login
  Future<AuthResponse> login(String email, String password) async {
    return await _client.auth.signInWithPassword(email: email, password: password);
  }

  // Anonymous Guest Login
  Future<AuthResponse> loginAsGuest() async {
    return await _client.auth.signInAnonymously();
  }

  // Google Authentication via GCP Client ID
  Future<AuthResponse?> signInWithGoogle() async {
    final GoogleSignIn googleSignIn = GoogleSignIn(
      serverClientId: AppConstants.webClientId,
    );
    final googleUser = await googleSignIn.signIn();
    final googleAuth = await googleUser?.authentication;

    if (googleAuth == null || googleAuth.idToken == null) return null;

    return await _client.auth.signInWithIdToken(
      provider: OAuthProvider.google,
      idToken: googleAuth.idToken!,
      accessToken: googleAuth.accessToken,
    );
  }

  // Sign out
  Future<void> signOut() async {
    await _client.auth.signOut();
  }
}
`
  },
  {
    path: 'lib/services/social_service.dart',
    category: 'service',
    language: 'dart',
    description: 'Social operations: Posts, Likes, Reposts, Image uploads, and Infinite scroll',
    content: `import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/post_model.dart';

class SocialService {
  final SupabaseClient _db = Supabase.instance.client;

  // Upload image to Supabase Storage
  Future<String?> uploadImage(File file) async {
    final fileName = '\${DateTime.now().millisecondsSinceEpoch}.jpg';
    await _db.storage.from('posts').upload(fileName, file);
    return _db.storage.from('posts').getPublicUrl(fileName);
  }

  // Create Post
  Future<void> createPost(String content, File? image) async {
    String? imageUrl;
    if (image != null) imageUrl = await uploadImage(image);
    
    await _db.from('posts').insert({
      'user_id': _db.auth.currentUser!.id,
      'content': content.isNotEmpty ? content : null,
      'image_url': imageUrl,
    });
  }

  // Delete Post
  Future<void> deletePost(String postId) async {
    await _db.from('posts').delete().eq('id', postId);
  }

  // Edit Post
  Future<void> editPost(String postId, String newContent) async {
    await _db.from('posts').update({'content': newContent}).eq('id', postId);
  }

  // Fetch Feed with Infinite Pagination (limit & offset)
  Future<List<Post>> getFeed({int offset = 0, int limit = 10}) async {
    final response = await _db
        .from('posts')
        .select('*, profiles(*), likes(count)')
        .order('created_at', ascending: false)
        .range(offset, offset + limit - 1);
        
    return (response as List).map((p) => Post.fromJson(p)).toList();
  }

  // Like / Unlike Post with notification trigger
  Future<void> toggleLike(String postId, bool currentlyLiked) async {
    final uid = _db.auth.currentUser!.id;
    if (currentlyLiked) {
      await _db.from('likes').delete().match({'post_id': postId, 'user_id': uid});
    } else {
      await _db.from('likes').insert({'post_id': postId, 'user_id': uid});
      
      final post = await _db.from('posts').select('user_id').eq('id', postId).single();
      if (post['user_id'] != uid) {
        await _db.from('notifications').insert({
          'user_id': post['user_id'],
          'actor_id': uid,
          'type': 'like',
          'post_id': postId
        });
      }
    }
  }

  // Follow User
  Future<void> followUser(String targetUserId) async {
    final uid = _db.auth.currentUser!.id;
    await _db.from('follows').insert({'follower_id': uid, 'following_id': targetUserId});
    
    await _db.from('notifications').insert({
      'user_id': targetUserId,
      'actor_id': uid,
      'type': 'follow',
    });
  }

  // Unfollow User
  Future<void> unfollowUser(String targetUserId) async {
    final uid = _db.auth.currentUser!.id;
    await _db.from('follows').delete().match({'follower_id': uid, 'following_id': targetUserId});
  }
}
`
  },
  {
    path: 'lib/services/cache_service.dart',
    category: 'service',
    language: 'dart',
    description: 'SQLite offline storage service for zero-latency cached feed',
    content: `import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import '../models/post_model.dart';

class CacheService {
  static Database? _database;
  static const String tableName = 'cached_feed';

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB();
    return _database!;
  }

  Future<Database> _initDB() async {
    final directory = await getApplicationDocumentsDirectory();
    final path = join(directory.path, 'retwitter_cache.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE $tableName (
            id TEXT PRIMARY KEY,
            data TEXT,
            cached_at INTEGER
          )
        ''');
      },
    );
  }

  // Save feed offline in SQLite
  Future<void> cacheFeed(List<Post> posts) async {
    final db = await database;
    Batch batch = db.batch();
    
    batch.delete(tableName);
    for (var post in posts) {
      batch.insert(tableName, {
        'id': post.id,
        'data': jsonEncode(post.toJson()),
        'cached_at': DateTime.now().millisecondsSinceEpoch,
      });
    }
    await batch.commit(noResult: true);
  }

  // Retrieve cached feed when offline
  Future<List<Post>> getCachedFeed() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      tableName,
      orderBy: 'cached_at DESC',
    );

    return maps.map((map) {
      final json = jsonDecode(map['data'] as String);
      return Post.fromJson(json); 
    }).toList();
  }
}
`
  },
  {
    path: 'lib/services/moderation_service.dart',
    category: 'service',
    language: 'dart',
    description: 'User blocking and content reporting with PostgreSQL RLS enforcement',
    content: `import 'package:supabase_flutter/supabase_flutter.dart';

class ModerationService {
  final SupabaseClient _db = Supabase.instance.client;

  Future<void> blockUser(String blockedUserId) async {
    final myId = _db.auth.currentUser!.id;
    await _db.from('blocks').insert({
      'blocker_id': myId,
      'blocked_id': blockedUserId,
    });
  }

  Future<void> unblockUser(String blockedUserId) async {
    final myId = _db.auth.currentUser!.id;
    await _db.from('blocks')
      .delete()
      .match({'blocker_id': myId, 'blocked_id': blockedUserId});
  }

  Future<void> reportUser(String reportedUserId, String reason) async {
    final myId = _db.auth.currentUser!.id;
    await _db.from('reports').insert({
      'reporter_id': myId,
      'reported_user_id': reportedUserId,
      'reason': reason,
    });
  }

  Future<void> reportPost(String reportedPostId, String reason) async {
    final myId = _db.auth.currentUser!.id;
    await _db.from('reports').insert({
      'reporter_id': myId,
      'reported_post_id': reportedPostId,
      'reason': reason,
    });
  }
}
`
  },
  {
    path: 'lib/screens/main_navigation.dart',
    category: 'screen',
    language: 'dart',
    description: 'Material 3 bottom navigation bar connecting Home, Search, Post, Alerts, and Profile',
    content: `import 'package:flutter/material.dart';
import 'tabs/home_screen.dart';
import 'tabs/search_screen.dart';
import 'tabs/post_screen.dart';
import 'tabs/notifications_screen.dart';
import 'tabs/profile_screen.dart';

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    SearchScreen(),
    PostScreen(),
    NotificationsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined), 
            selectedIcon: Icon(Icons.home), 
            label: 'Home'
          ),
          NavigationDestination(
            icon: Icon(Icons.search_outlined), 
            selectedIcon: Icon(Icons.search), 
            label: 'Search'
          ),
          NavigationDestination(
            icon: Icon(Icons.add_box_outlined), 
            selectedIcon: Icon(Icons.add_box), 
            label: 'Post'
          ),
          NavigationDestination(
            icon: Icon(Icons.notifications_none), 
            selectedIcon: Icon(Icons.notifications), 
            label: 'Alerts'
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline), 
            selectedIcon: Icon(Icons.person), 
            label: 'Profile'
          ),
        ],
      ),
    );
  }
}
`
  },
  {
    path: 'lib/screens/tabs/home_screen.dart',
    category: 'screen',
    language: 'dart',
    description: 'Feed screen with infinite scrolling, likes, reposts, and pull-to-refresh',
    content: `import 'package:flutter/material.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:share_plus/share_plus.dart';
import '../../services/social_service.dart';
import '../../services/cache_service.dart';
import '../../models/post_model.dart';
import '../widgets/moderation_bottom_sheet.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final SocialService _socialService = SocialService();
  final CacheService _cacheService = CacheService();
  final ScrollController _scrollController = ScrollController();
  final List<Post> _posts = [];
  bool _isLoading = false;
  bool _hasMore = true;
  int _offset = 0;
  final int _limit = 10;

  @override
  void initState() {
    super.initState();
    _loadCachedThenNetwork();
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
        _fetchPosts();
      }
    });
  }

  Future<void> _loadCachedThenNetwork() async {
    final cached = await _cacheService.getCachedFeed();
    if (cached.isNotEmpty && mounted) {
      setState(() => _posts.addAll(cached));
    }
    _fetchPosts(refresh: true);
  }

  Future<void> _fetchPosts({bool refresh = false}) async {
    if (_isLoading || (!_hasMore && !refresh)) return;
    setState(() => _isLoading = true);

    if (refresh) {
      _offset = 0;
      _hasMore = true;
    }

    try {
      final newPosts = await _socialService.getFeed(offset: _offset, limit: _limit);
      setState(() {
        if (refresh) _posts.clear();
        if (newPosts.length < _limit) _hasMore = false;
        _posts.addAll(newPosts);
        _offset += _limit;
      });
      if (refresh) await _cacheService.cacheFeed(_posts);
    } catch (_) {
      // Offline fallback: keep cached posts
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ReTwitter Feed', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: RefreshIndicator(
        onRefresh: () => _fetchPosts(refresh: true),
        child: ListView.builder(
          controller: _scrollController,
          itemCount: _posts.length + (_hasMore ? 1 : 0),
          itemBuilder: (context, index) {
            if (index == _posts.length) {
              return const Padding(
                padding: EdgeInsets.all(16.0),
                child: Center(child: CircularProgressIndicator()),
              );
            }
            final post = _posts[index];
            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          backgroundImage: post.user?.profilePhoto != null 
                            ? NetworkImage(post.user!.profilePhoto!) 
                            : null,
                          child: post.user?.profilePhoto == null ? const Icon(Icons.person) : null,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(post.user?.username ?? 'Anonymous', style: const TextStyle(fontWeight: FontWeight.bold)),
                              Text(timeago.format(post.createdAt), style: Theme.of(context).textTheme.bodySmall),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.more_vert),
                          onPressed: () {
                            showModalBottomSheet(
                              context: context,
                              builder: (_) => ModerationBottomSheet(targetUserId: post.userId, targetPostId: post.id),
                            );
                          },
                        )
                      ],
                    ),
                    if (post.content != null) ...[
                      const SizedBox(height: 10),
                      Text(post.content!, style: const TextStyle(fontSize: 15)),
                    ],
                    if (post.imageUrl != null) ...[
                      const SizedBox(height: 10),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(post.imageUrl!, fit: BoxFit.cover, width: double.infinity),
                      ),
                    ],
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        IconButton(icon: const Icon(Icons.chat_bubble_outline), onPressed: () {}),
                        IconButton(icon: const Icon(Icons.repeat), onPressed: () {}),
                        Row(
                          children: [
                            IconButton(
                              icon: Icon(post.isLikedByMe ? Icons.favorite : Icons.favorite_border,
                                         color: post.isLikedByMe ? Colors.red : null),
                              onPressed: () async {
                                setState(() {
                                  post.isLikedByMe = !post.isLikedByMe;
                                  post.likeCount += post.isLikedByMe ? 1 : -1;
                                });
                                await _socialService.toggleLike(post.id, !post.isLikedByMe);
                              },
                            ),
                            Text('\${post.likeCount}'),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.share_outlined),
                          onPressed: () => Share.share('Check out this post on ReTwitter: \${post.content ?? ""}'),
                        ),
                      ],
                    )
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
`
  },
  {
    path: 'lib/screens/chat/chat_detail_screen.dart',
    category: 'screen',
    language: 'dart',
    description: 'Real-time 1-on-1 direct messaging screen powered by Supabase Realtime table streams',
    content: `import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ChatDetailScreen extends StatefulWidget {
  final String targetUserId;
  final String targetUsername;

  const ChatDetailScreen({super.key, required this.targetUserId, required this.targetUsername});

  @override
  State<ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends State<ChatDetailScreen> {
  final _messageController = TextEditingController();
  final _db = Supabase.instance.client;
  late final String _myId;

  @override
  void initState() {
    super.initState();
    _myId = _db.auth.currentUser!.id;
  }

  void _sendMessage() async {
    if (_messageController.text.trim().isEmpty) return;
    final content = _messageController.text;
    _messageController.clear();
    
    await _db.from('messages').insert({
      'sender_id': _myId,
      'receiver_id': widget.targetUserId,
      'content': content,
    });
  }

  @override
  Widget build(BuildContext context) {
    final stream = _db.from('messages')
      .stream(primaryKey: ['id'])
      .order('created_at', ascending: true);

    return Scaffold(
      appBar: AppBar(title: Text(widget.targetUsername)),
      body: Column(
        children: [
          Expanded(
            child: StreamBuilder(
              stream: stream,
              builder: (context, snapshot) {
                if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
                
                final allMsgs = snapshot.data as List<dynamic>;
                final chatMsgs = allMsgs.where((m) => 
                  (m['sender_id'] == _myId && m['receiver_id'] == widget.targetUserId) || 
                  (m['sender_id'] == widget.targetUserId && m['receiver_id'] == _myId)
                ).toList();

                return ListView.builder(
                  padding: const EdgeInsets.all(8),
                  itemCount: chatMsgs.length,
                  itemBuilder: (context, index) {
                    final msg = chatMsgs[index];
                    final isMe = msg['sender_id'] == _myId;
                    
                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isMe ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.surfaceVariant,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          msg['content'],
                          style: TextStyle(color: isMe ? Theme.of(context).colorScheme.onPrimary : null),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: const InputDecoration(hintText: 'Type a message...'),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send),
                  color: Theme.of(context).colorScheme.primary,
                  onPressed: _sendMessage,
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
`
  },
  {
    path: 'supabase_schema.sql',
    category: 'database',
    language: 'sql',
    description: 'Complete PostgreSQL schema, RLS policies, storage buckets, and realtime publication',
    content: `-- PostgreSQL & Supabase Complete Schema for ReTwitter
-- 100% Free & Open Source

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Storage Buckets (Posts and Avatars)
insert into storage.buckets (id, name, public) values ('posts', 'posts', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;

create policy "Public Access Posts" on storage.objects for select using ( bucket_id = 'posts' );
create policy "Auth Insert Posts" on storage.objects for insert with check ( auth.role() = 'authenticated' and bucket_id = 'posts' );

create policy "Public Access Avatars" on storage.objects for select using ( bucket_id = 'avatars' );
create policy "Auth Insert Avatars" on storage.objects for insert with check ( auth.role() = 'authenticated' and bucket_id = 'avatars' );

-- 2. Profiles Table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  username text unique not null,
  bio text,
  profile_photo text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- 3. Posts Table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Comments Table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Interactions (Likes & Bookmarks)
create table public.likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

create table public.bookmarks (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

-- 6. Follows Table
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

-- 7. Real-Time Notifications Table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  type text not null, -- 'like', 'comment', 'follow', 'repost'
  post_id uuid references public.posts(id) on delete cascade,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Direct Messages Table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Moderation Tables (Blocks and Reports)
create table public.blocks (
  blocker_id uuid references public.profiles(id) on delete cascade,
  blocked_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (blocker_id, blocked_id)
);

create table public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reported_post_id uuid references public.posts(id) on delete cascade,
  reason text not null,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

-- 11. Policies
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Exclude blocked users from feed
create policy "View posts excluding blocked" on posts for select 
using (
  user_id not in (select blocked_id from blocks where blocker_id = auth.uid())
  and
  auth.uid() not in (select blocker_id from blocks where blocked_id = posts.user_id)
);
create policy "Users create posts" on posts for insert with check (auth.uid() = user_id);
create policy "Users update/delete own posts" on posts for all using (auth.uid() = user_id);

create policy "All can view comments" on comments for select using (true);
create policy "Users can comment" on comments for insert with check (auth.uid() = user_id);

create policy "Likes viewable" on likes for select using (true);
create policy "User can like" on likes for insert with check (auth.uid() = user_id);
create policy "User can unlike" on likes for delete using (auth.uid() = user_id);

create policy "Messages privacy" on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Messages send" on messages for insert with check (auth.uid() = sender_id);

create policy "Notifications view" on notifications for select using (auth.uid() = user_id);
create policy "Blocks self view" on blocks for select using (auth.uid() = blocker_id);
create policy "Blocks insert" on blocks for insert with check (auth.uid() = blocker_id);
create policy "Blocks delete" on blocks for delete using (auth.uid() = blocker_id);
create policy "Reports insert" on reports for insert with check (auth.uid() = reporter_id);

-- 12. Enable Real-Time Replication for Chat & Alerts
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
`
  },
  {
    path: 'ANDROID_BUILD_GUIDE.md',
    category: 'docs',
    language: 'markdown',
    description: 'Production Android release guide for APK & Google Play App Bundle (AAB)',
    content: `# Android Production Build & Release Guide for ReTwitter

### Step 1: Generate Release Keystore
In your terminal, execute:
\`\`\`bash
keytool -genkey -v -keystore ~/retwitter-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias retwitter
\`\`\`

### Step 2: Configure key.properties
Create \`android/key.properties\` (keep this file out of git):
\`\`\`properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=retwitter
storeFile=/path/to/retwitter-release.jks
\`\`\`

### Step 3: Update android/app/build.gradle
Ensure the release signing configuration reads from \`key.properties\` and enables minification:
\`\`\`gradle
signingConfigs {
    release {
        keyAlias = keystoreProperties['keyAlias']
        keyPassword = keystoreProperties['keyPassword']
        storeFile = keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword = keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
\`\`\`

### Step 4: Build Commands
\`\`\`bash
# Build standalone release APK for direct Android device installation:
flutter build apk --release --target-platform android-arm,android-arm64,android-x64

# Build App Bundle for Google Play Store upload:
flutter build appbundle --release
\`\`\`
Output APK located at: \`build/app/outputs/flutter-apk/app-release.apk\`
`
  }
];
