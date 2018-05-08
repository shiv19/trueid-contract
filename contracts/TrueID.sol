pragma solidity ^0.4.20;

contract TrueID {
    // Creator of the contract
    address public government;

    struct User {
        string fullName;
        string fatherName;
        string motherName;
        string contactAddress;
        string gender;
        string birthdate;
        string country;
        uint index;
    }

    address[] public userIndexes;
    mapping(address => User) users;

    struct Provider {
        string name;
        string contactAddress;
        string email;
        uint index;
    }

    address[] public providerIndexes;
    mapping(address => Provider) providers;

    // constructor
    function TrueID() public {
        government = msg.sender;
    }

    function editUser(address userAddress, string fullName, string fatherName, string motherName, string contactAddress, string gender, string birthdate, string country) public restricted {
        if (isNewUser(userAddress)) {
            users[userAddress].index = userIndexes.push(userAddress) - 1;
        }
        users[userAddress].fullName = fullName;
        users[userAddress].fatherName = fatherName;
        users[userAddress].motherName = motherName;
        users[userAddress].contactAddress = contactAddress;
        users[userAddress].gender = gender;
        users[userAddress].birthdate = birthdate;
        users[userAddress].country = country;
    }

    function deleteUser(address userAddress) public restricted {
        uint indexToDelete = users[userAddress].index;
        address lastAddress = userIndexes[userIndexes.length - 1];
        userIndexes[indexToDelete] = lastAddress;
        userIndexes.length --;
        users[lastAddress].index = indexToDelete;
    }

    function editProvider(address providerAddress, string name, string contactAddress, string email) public restricted {
        if(isNewProvider(providerAddress)){
            providers[providerAddress].index = providerIndexes.push(providerAddress) - 1;
        }
        providers[providerAddress].name = name;
        providers[providerAddress].contactAddress = contactAddress;
        providers[providerAddress].email = email;
    }

    function deleteProvider(address providerAddress) public restricted {
        uint indexToDelete = providers[providerAddress].index;
        address lastAddress = providerIndexes[providerIndexes.length - 1];
        providerIndexes[indexToDelete] = lastAddress;
        providerIndexes.length --;
        providers[lastAddress].index = indexToDelete;
    }

    function getProviders() public view returns(address[]) {
        return providerIndexes;
    }

    function getProvider(address providerAddress) public view returns (string, string, string) {
        if (isNewProvider(providerAddress)) {
            return ("", "", "");
        }
        return (providers[providerAddress].name, providers[providerAddress].contactAddress, providers[providerAddress].email);
    }

    function getUsers() public view returns(address[]) {
        return userIndexes;
    }

    function getUser(address userAddress) public  restricted view returns (string, string, string, string, string, string, string) {
        if (isNewUser(userAddress)) {
            return ("","","","","","","");
        }
        return (users[userAddress].fullName,
            users[userAddress].fatherName,
            users[userAddress].motherName,
            users[userAddress].contactAddress,
            users[userAddress].gender,
            users[userAddress].birthdate,
            users[userAddress].country);
    }

    // User functions
    function getID() public view returns (string, string, string, string, string, string, string){
        address userAddress = msg.sender; 
        if (isNewUser(userAddress)) {
            return ("","","","","","","");
        }
        return (users[userAddress].fullName,
            users[userAddress].fatherName,
            users[userAddress].motherName,
            users[userAddress].contactAddress,
            users[userAddress].gender,
            users[userAddress].birthdate,
            users[userAddress].country);
    }

    // service provider functions
    // These verification functions are only accessible by service providers,
    function isIndian(address userAddress) public onlyProvider view returns(bool) {
        if(keccak256(users[userAddress].country)==keccak256("India")){
            return true;
        }else{
            return false;
        }
    }

    function getUserDetails(address userAddress) public onlyProvider view returns(string, string, string, string, string, string, string) {
        if (isNewUser(userAddress)) {
            return ("","","","","","","");
        }
        return (users[userAddress].fullName,
            users[userAddress].fatherName,
            users[userAddress].motherName,
            users[userAddress].contactAddress,
            users[userAddress].gender,
            users[userAddress].birthdate,
            users[userAddress].country);
    }

    // More verification functions can be added similarly

    // Private functions
    function isNewUser(address userAddress) private view returns(bool) {
        if (userIndexes.length == 0) {
            return true;
        }
        return (userIndexes[users[userAddress].index] != userAddress);
    }

    function isNewProvider(address providerAddress) private view returns(bool) {
        if (providerIndexes.length == 0) {
            return true;
        }
        return (providerIndexes[providers[providerAddress].index] != providerAddress);
    }

    // Modifiers
    modifier restricted() {
        require(msg.sender == government);
        _;
    }

    modifier onlyProvider() {
        require(!isNewProvider(msg.sender));
        _;
    }

}