# Database Schema

This project uses MongoDB (NoSQL) with Mongoose as the ODM. The schema is designed around three core entities: `User`, `Media`, and `Transaction`.

## 1. User Collection
Stores authentication details, wallet balance, and a reference list of media the user has unlocked.

```javascript
{
  _id: ObjectId,
  name: String (Required),
  email: String (Required, Unique),
  password: String (Required, Hashed),
  walletBalance: Number (Default: 100),
  unlockedMedia: [ ObjectId (Ref: 'Media') ],
  createdAt: Date,
  updatedAt: Date
}
```

## 2. Media Collection
Stores metadata about uploaded images, including their price, owner, and internal keys for the S3 object storage.

```javascript
{
  _id: ObjectId,
  owner: ObjectId (Ref: 'User', Required),
  price: Number (Required),
  originalKey: String (Required), // S3 path to high-res image
  previewKey: String (Required),  // S3 path to watermarked preview
  createdAt: Date,
  updatedAt: Date
}
```

## 3. Transaction Collection
Acts as an immutable audit log for all wallet interactions. Currently tracks purchases, but can easily be extended to support deposits.

```javascript
{
  _id: ObjectId,
  buyer: ObjectId (Ref: 'User', Required),
  media: ObjectId (Ref: 'Media', Required),
  amount: Number (Required),
  type: String (Enum: ['purchase', 'deposit'], Default: 'purchase'),
  createdAt: Date,
  updatedAt: Date
}
```

## Relationships & Integrity
- **One-to-Many (User -> Media):** A single User can own multiple Media documents. The `owner` field on Media references the User.
- **Many-to-Many (User -> Unlocked Media):** The `unlockedMedia` array on the User document holds references to multiple Media documents they have purchased. 
- **Audit Logging:** Every time a user unlocks media, a `Transaction` is created linking the User, the Media, and recording the cost at the time of purchase.
