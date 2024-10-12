#[allow(duplicate_alias)]
/// Module: social_network
module social_network::social_network {
    use std::string::String;
    use sui::object;
    use sui::table::{Self, Table};

    use sui::event;


    /// A Forum of topics.
    public struct Forum has key, store {
        id: UID,
        topics: Table<ID, Topic>,
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

    /// On deployment, the contract creates its Forum object.
    fun init(ctx: &mut TxContext) {
        transfer::share_object(Forum {
            id: object::new(ctx),
            topics: table::new(ctx),
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
}

