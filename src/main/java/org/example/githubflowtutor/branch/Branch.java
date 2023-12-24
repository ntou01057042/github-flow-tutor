package org.example.githubflowtutor.branch;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("branches")
public class Branch {
    @Id
    private String id;
    private String name;
    private long lastTimestamp;

    public Branch() {
    }

    public Branch(String name, long lastTimestamp) {
        this.name = name;
        this.lastTimestamp = lastTimestamp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getLastTimestamp() {
        return lastTimestamp;
    }

    public void setLastTimestamp(long lastTimestamp) {
        this.lastTimestamp = lastTimestamp;
    }
}
