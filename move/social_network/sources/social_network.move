
/// Module: social_network
module social_network::social_network {
    use std::string::String;
    use sui::clock::Clock;
    use sui::table::{Self, Table};

    const USERNAME_NOT_AVAILABLE_ERROR : u64 = 202;
    const USER_ALREADY_REGISTERED_ERROR : u64 = 204;

    /// A Forum of topics.
    public struct Forum has key, store {
        id: UID,
        topics: vector<Topic>,
        users: Table<address, User>,
        usernames_taken: vector<String>
    }

    /// A user with profile data and posts.
    public struct User has key, store {
        id: UID,
        user_address: address,  
        username: String,   
        email: String,      
        join_date: u64,         
        posts: vector<Post>,    
    }

    /// A Topic with posts.
    public struct Topic has key, store {
        id: UID,
        creator: address,
        title: String,
        posts: vector<Post>,
    }

    /// A Post with comments.
    public struct Post has key, store {
        id: UID,
        creator: address,
        text: String,
        comments: vector<Comment>,
    }

    /// A Comment on a post.
    public struct Comment has key, store {
        id: UID,
        creator: address,
        text: String,
    }

    /// On deployment, the contract creates its Forum object.
    fun init(ctx: &mut TxContext) {
        transfer::share_object(Forum {
            id: object::new(ctx),
            topics: vector::empty<Topic>(),
            users: table::new<address, User>(ctx),
            usernames_taken: vector::empty<String>()
        });
    }

    /// Create a new topic in the forum.
    public fun create_topic(forum: &mut Forum, title: String, ctx: &mut TxContext) {
        let topic = Topic {
            id: object::new(ctx),
            creator: ctx.sender(),
            title: title,
            posts: vector::empty<Post>()
        };
        vector::push_back(&mut forum.topics, topic);
    }

    /// Create a new post in a topic.
    public fun create_post(topic: &mut Topic, text: String, ctx: &mut TxContext) {
        let post = Post {
            id: object::new(ctx),
            creator: ctx.sender(),
            text: text,
            comments: vector::empty<Comment>()
        };
        vector::push_back(&mut topic.posts, post);
    }

    /// Create a new comment on a post.
    public fun create_comment(post: &mut Post, text: String, ctx: &mut TxContext) {
        let comment = Comment {
            id: object::new(ctx),
            creator: ctx.sender(),
            text: text
        };
        vector::push_back(&mut post.comments, comment);
    }

    /// Check if the user is already registered
    public fun user_exists(forum: &mut Forum, user_address: address): bool {
        return forum.users.contains(user_address)
    }

    /// Check if the username is already used
    public fun username_exists(forum: &mut Forum, username: String): bool {
        return std::vector::contains(&forum.usernames_taken,&username)
    }

    /// Create a new user in the forum.
    public fun create_user(forum: &mut Forum, username: String, email: String, clock: &Clock, ctx: &mut TxContext) {
        assert!(!user_exists(forum, ctx.sender()), USER_ALREADY_REGISTERED_ERROR);
        assert!(!username_exists(forum, username), USERNAME_NOT_AVAILABLE_ERROR);
        let user = User {
            id: object::new(ctx),
            user_address: ctx.sender(),
            username: username,
            email: email,
            join_date: clock.timestamp_ms(),
            posts: vector::empty<Post>(),
        };
        forum.users.add(ctx.sender(), user);
        // transfer::public_transfer(user, ctx.sender());
    }
}

