// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface ONLY: opens the existing deployed GroupFarm in Remix using "At Address".
// This is NOT the original farm source code and must not be submitted as a substitute.
interface IGroupFarm {
    function POOL_COUNT() external view returns (uint256);
    function POOL_BUDGET() external view returns (uint256);
    function TOTAL_BUDGET() external view returns (uint256);
    function rewardToken() external view returns (address);
    function sessionAdmin() external view returns (address);
    function started() external view returns (bool);
    function startTime() external view returns (uint256);
    function endTime() external view returns (uint256);
    function duration() external view returns (uint256);

    function pools(uint256 id) external view returns (
        address lpToken,
        uint256 totalStaked,
        uint256 rewardPerTokenStored,
        uint256 lastUpdateTime,
        uint256 paidOut
    );
    function balances(uint256 poolId, address account) external view returns (uint256);
    function earned(address account, uint256 poolId) external view returns (uint256);
    function earnedAll(address account) external view returns (uint256);

    function startSession() external;
    function stake(uint256 poolId, uint256 amount) external;
    function withdraw(uint256 poolId, uint256 amount) external;
    function claim(uint256 poolId) external;
    function claimAll() external;
}
