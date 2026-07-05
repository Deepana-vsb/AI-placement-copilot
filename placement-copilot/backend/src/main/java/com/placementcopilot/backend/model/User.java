package com.placementcopilot.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    private String passwordHash;
    private String college;
    private String branchYear;
    private Instant createdAt;

    // Advanced student profile fields
    private String dob;
    private String location;
    private String phone;
    private Double cgpa;
    private Double tenthMark;
    private Double twelfthMark;
    private String profilePicture;
    private boolean isPro = false;

    public User() {}

    public User(String name, String email, String passwordHash, String college, String branchYear, Instant createdAt) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.college = college;
        this.branchYear = branchYear;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }

    public String getBranchYear() { return branchYear; }
    public void setBranchYear(String branchYear) { this.branchYear = branchYear; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    // Advanced details getters & setters
    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }

    public Double getTenthMark() { return tenthMark; }
    public void setTenthMark(Double tenthMark) { this.tenthMark = tenthMark; }

    public Double getTwelfthMark() { return twelfthMark; }
    public void setTwelfthMark(Double twelfthMark) { this.twelfthMark = twelfthMark; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }

    public boolean isPro() { return isPro; }
    public void setPro(boolean pro) { isPro = pro; }
}
