import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Bool "mo:core/Bool";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Role
  type UserRole = AccessControl.UserRole;

  // User Profile
  public type UserProfile = {
    name : Text;
    role : Text; // "buyer" or "seller"
    bio : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Dress Listing
  type DressListing = {
    id : Nat;
    title : Text;
    description : Text;
    price : Nat; // price in cents
    size : Text;
    condition : Text;
    color : Text;
    photos : [Storage.ExternalBlob];
    sellerId : Principal;
    isAvailable : Bool;
    isFeatured : Bool;
  };

  // Message
  type Message = {
    buyerId : Principal;
    sellerId : Principal;
    listingId : Nat;
    message : Text;
  };

  // State
  let listings = Map.empty<Nat, DressListing>();
  let messages = Map.empty<Nat, [Message]>();
  var listingIdCounter = 0;

  // ---- User Profile Methods ----

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ---- CRUD methods for Dress Listings ----

  public shared ({ caller }) func addListing(title : Text, description : Text, price : Nat, size : Text, condition : Text, color : Text, photos : [Storage.ExternalBlob], isFeatured : Bool) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only sellers can add listings");
    };

    listingIdCounter += 1;
    let newListing : DressListing = {
      id = listingIdCounter;
      title;
      description;
      price;
      size;
      condition;
      color;
      photos;
      sellerId = caller;
      isAvailable = true;
      isFeatured;
    };
    listings.add(listingIdCounter, newListing);
    listingIdCounter;
  };

  public shared ({ caller }) func updateListing(listingId : Nat, title : Text, description : Text, price : Nat, size : Text, condition : Text, color : Text, photos : [Storage.ExternalBlob], isAvailable : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update listings");
    };
    let listing = switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) { l };
    };
    if (listing.sellerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the listing owner or an admin can update this listing");
    };
    let updatedListing = {
      listing with
      title;
      description;
      price;
      size;
      condition;
      color;
      photos;
      isAvailable;
    };
    listings.add(listingId, updatedListing);
  };

  public shared ({ caller }) func deleteListing(listingId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete listings");
    };
    let listing = switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) { l };
    };
    if (listing.sellerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the listing owner or an admin can delete this listing");
    };
    listings.remove(listingId);
  };

  public query ({ caller }) func getListing(id : Nat) : async ?DressListing {
    listings.get(id);
  };

  public query ({ caller }) func getAllListings() : async [DressListing] {
    listings.values().toArray();
  };

  public query ({ caller }) func searchListings(keyword : Text) : async [DressListing] {
    listings.values().toArray().filter(func(listing) {
      listing.title.contains(#text keyword) or listing.description.contains(#text keyword)
    });
  };

  public query ({ caller }) func filterBySize(size : Text) : async [DressListing] {
    listings.values().toArray().filter(func(listing) { listing.size == size });
  };

  public query ({ caller }) func filterByPrice(minPrice : Nat, maxPrice : Nat) : async [DressListing] {
    listings.values().toArray().filter(func(listing) {
      listing.price >= minPrice and listing.price <= maxPrice
    });
  };

  public query ({ caller }) func filterByColor(color : Text) : async [DressListing] {
    listings.values().toArray().filter(func(listing) { listing.color == color });
  };

  public query ({ caller }) func filterByCondition(condition : Text) : async [DressListing] {
    listings.values().toArray().filter(func(listing) { listing.condition == condition });
  };

  public query ({ caller }) func getFeaturedListings() : async [DressListing] {
    listings.values().toArray().filter(func(listing) { listing.isFeatured });
  };

  public query ({ caller }) func getAvailableListings() : async [DressListing] {
    listings.values().toArray().filter(func(listing) { listing.isAvailable });
  };

  public query ({ caller }) func getSellerListings(sellerId : Principal) : async [DressListing] {
    listings.values().toArray().filter(func(listing) { listing.sellerId == sellerId });
  };

  // ---- Messaging System ----

  public shared ({ caller }) func sendMessage(sellerId : Principal, listingId : Nat, message : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can send messages");
    };

    // Verify the listing exists
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?_) {};
    };

    let newMessage : Message = {
      buyerId = caller;
      sellerId;
      listingId;
      message;
    };

    let existingMessages = switch (messages.get(listingId)) {
      case (null) { [] };
      case (?msgs) { msgs };
    };
    messages.add(listingId, existingMessages.concat([newMessage]));
  };

  public query ({ caller }) func getMessages(listingId : Nat) : async [Message] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can read messages");
    };

    let listing = switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) { l };
    };

    // Only the seller of the listing, a buyer who sent a message, or an admin can read messages
    let isListingSeller = listing.sellerId == caller;
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    let allMessages = switch (messages.get(listingId)) {
      case (null) { [] };
      case (?msgs) { msgs };
    };

    let isBuyerInConversation = allMessages.any(func(msg) { msg.buyerId == caller });

    if (not isListingSeller and not isAdmin and not isBuyerInConversation) {
      Runtime.trap("Unauthorized: Only the seller, involved buyers, or admins can view messages for this listing");
    };

    allMessages;
  };

  // ---- Promote Listing ----

  public shared ({ caller }) func promoteListing(listingId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can promote listings");
    };

    let listing = switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) { l };
    };

    // Only the listing owner or an admin can promote a listing
    if (listing.sellerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the listing owner or an admin can promote this listing");
    };

    let updatedListing = { listing with isFeatured = true };
    listings.add(listingId, updatedListing);
  };
};
