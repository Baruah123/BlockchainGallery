// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PhotoStorage {
    struct Photo {
        string hash;
        string emotion;
        uint256 timestamp;
    }

    Photo[] public photos;

    function storePhotoHash(string memory hash, string memory emotion, uint256 timestamp) public {
        photos.push(Photo(hash, emotion, timestamp));
    }

    function getPhotoHash(uint256 index) public view returns (string memory hash, string memory emotion, uint256 timestamp) {
        require(index < photos.length, "Photo not found");
        Photo memory photo = photos[index];
        return (photo.hash, photo.emotion, photo.timestamp);
    }
}
