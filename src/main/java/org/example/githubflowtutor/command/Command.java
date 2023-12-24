package org.example.githubflowtutor.command;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("commands")
public class Command {
    @Id
    private String id;
    private String syntax;
    private long timestamp;
    private long parentTimestamp;

    public Command() {
    }

    public Command(String syntax, long timestamp, long parentTimestamp) {
        this.syntax = syntax;
        this.timestamp = timestamp;
        this.parentTimestamp = parentTimestamp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSyntax() {
        return syntax;
    }

    public void setSyntax(String syntax) {
        this.syntax = syntax;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public long getParentTimestamp() {
        return parentTimestamp;
    }

    public void setParentTimestamp(long parentTimestamp) {
        this.parentTimestamp = parentTimestamp;
    }
}
