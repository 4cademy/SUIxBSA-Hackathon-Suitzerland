
/// Module: social_network
module social_network::social_network {
    use std::string::String;
    use std::vector;


    /// A Forum of topics.
    public struct Forum has key, store {
        id: UID,
        topics: vector<Topic>,
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
            topics: vector::empty<Topic>()
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
    public fun create_post(ctx: &mut TxContext, topic: &mut Topic, text: String) {
        let post = Post {
            id: object::new(ctx),
            creator: ctx.sender(),
            text: text,
            comments: vector::empty<Comment>()
        };
        vector::push_back(&mut topic.posts, post);
    }

    /// Create a new comment on a post.
    public fun create_comment(ctx: &mut TxContext, post: &mut Post, text: String) {
        let comment = Comment {
            id: object::new(ctx),
            creator: ctx.sender(),
            text: text
        };
        vector::push_back(&mut post.comments, comment);
    }
}

