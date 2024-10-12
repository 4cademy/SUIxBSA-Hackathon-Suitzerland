#[allow(duplicate_alias)]
/// Module: social_network
module social_network::social_network {
    use std::string::String;
    use sui::object;
    use sui::table::{Self, Table};

    use sui::event;
    use sui::clock::Clock;

    const USERNAME_NOT_AVAILABLE_ERROR : u64 = 202;
    const USER_ALREADY_REGISTERED_ERROR : u64 = 204;


    /// A Forum of topics.
    public struct Forum has key, store {
        id: UID,
        topics: Table<ID, Topic>,
        users: Table<address, User>,
        usernames_taken: vector<String>
    }

    /// A Topic with posts.
    public struct Topic has key, store {
        id: UID,
        creator: address,
        title: String,
        posts: Table<ID, Post>,
    }

    /// A Post with comments.
    public struct Post has key, store {
        id: UID,
        topic_id: ID,
        creator: address,
        text: String,
        comments: Table<ID, Comment>,
    }

    /// A Comment on a post.
    public struct Comment has key, store {
        id: UID,
        post_id: ID,
        topic_id: ID,
        creator: address,
        text: String,
    }

    // Events
    public struct TopicCreated has copy, drop {
        topic_id: ID,
        creator: address,
        title: String,
    }

    public struct PostCreated has copy, drop {
        post_id: ID,
        creator: address,
        text: String,
    }

    public struct CommentCreated has copy, drop {
        comment_id: ID,
        creator: address,
        text: String,
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


    /// On deployment, the contract creates its Forum object.
    fun init(ctx: &mut TxContext) {
        transfer::share_object(Forum {
            id: object::new(ctx),
            topics: table::new(ctx),
            users: table::new<address, User>(ctx),
            usernames_taken: vector::empty<String>()
        });
    }

    /// Create a new topic in the forum.
    public fun create_topic(forum: &mut Forum, title: String, ctx: &mut TxContext): ID {
        let uid = object::new(ctx);
        let id = uid.to_inner();
        let topic = Topic {
            id: uid,
            creator: ctx.sender(),
            title: title,
            posts: table::new(ctx),
        };
        forum.topics.add(id, topic);
        let ev = TopicCreated {
            topic_id: id,
            creator: ctx.sender(),
            title: title,
        };
        event::emit(ev);
        id
    }

    /// Create a new post in a topic.
    public fun create_post(forum: &mut Forum, topic_id: ID, text: String, ctx: &mut TxContext): ID {
        let uid = object::new(ctx);
        let id = uid.to_inner();
        let post = Post {
            id: uid,
            topic_id: topic_id,
            creator: ctx.sender(),
            text: text,
            comments: table::new(ctx),
        };

        //let topics = &mut forum.topics;
        //let topic = table::borrow_mut(topics, topic_id);
        let topic = forum.topics.borrow_mut(topic_id);
        topic.posts.add(id, post);

        let ev = PostCreated {
            post_id: id,
            creator: ctx.sender(),
            text: text,
        };
        event::emit(ev);

        id
    }

    /// Create a new comment on a post.
    public fun create_comment(forum: &mut Forum, topic_id: ID, post_id: ID, text: String, ctx: &mut TxContext): ID {
        let uid = object::new(ctx);
        let id = uid.to_inner();
        let comment = Comment {
            id: uid,
            post_id: post_id,
            topic_id: topic_id,
            creator: ctx.sender(),
            text: text
        };
        let topics = &mut forum.topics;
        let topic = table::borrow_mut(topics, topic_id);
        let posts = &mut topic.posts;
        let post = table::borrow_mut(posts, post_id);
        post.comments.add(id, comment);

        let ev = CommentCreated {
            comment_id: id,
            creator: ctx.sender(),
            text: text,
        };

        event::emit(ev);

        id
    }

    #[test_only]
    public fun init_for_test(ctx: &mut TxContext) {
        init(ctx);

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

