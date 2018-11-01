## PubNub Channel Topology

When a user connects to ChatEngine, they are automatically connected to a {@link ChatEngine#"."global| ```global``` } channel with all {@link User| ```User```s }, and their own {@link User#direct| ```direct``` } channel and {@link Chat#feed| ```feed``` } channel by default. Users can also create new {@link Chat| ```Chat``` } rooms for public and private conversations with other users.
