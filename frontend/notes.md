I need to delete only the files that are items the user has removed from the preview images
A constraint is that the user may or may not add to the mutable previewImageArray

We need a list of items to delete that are both in the db and in our aws bucket

This bucket cannot be changed

When an item is removed from the mutable preview list, check if that item is also in the unmutable list

if so, create a new array that will be keys that you send to the back end to delete from db and bucket

If there previewImage is not in items to delete
we dont shift

