import javafx.animation.AnimationTimer;
import javafx.application.Application;
import javafx.geometry.Bounds;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.Pane;
import javafx.stage.Stage;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class Game extends Application {

    // خصائص اللعبة
    private boolean isRunning = false;
    private double gameSpeed = 2;
    private int score = 0;
    private Pane root;
    private Scene scene;
    private ImageView scoreText; // لتسجيل النقاط
    private final double SCREEN_WIDTH = 800;
    private final double SCREEN_HEIGHT = 400;

    // عناصر اللعبة
    private Player player;
    private Background background;
    private List<Obstacle> obstacles = new ArrayList<>();
    private List<Coin> coins = new ArrayList<>();
    Random random = new Random();


    @Override
    public void start(Stage primaryStage) {
        root = new Pane();
        scene = new Scene(root, SCREEN_WIDTH, SCREEN_HEIGHT);

        // إنشاء العناصر
        player = new Player(100, 250, "player.png", 5);
        background = new Background("background.png", 0, 0, gameSpeed);

        // إضافة العناصر إلى الشاشة
        root.getChildren().addAll(background.imageView, player.imageView);

        // لتسجيل النقاط
        scoreText = new ImageView(new Image(getClass().getResourceAsStream("zero.png")));
        scoreText.setX(700);
        scoreText.setY(20);
        root.getChildren().add(scoreText);

        // التحكم في حركة اللاعب
        scene.setOnKeyPressed(event -> {
            if (event.getCode() == KeyCode.LEFT) {
                player.speedX = -player.speed;
            } else if (event.getCode() == KeyCode.RIGHT) {
                player.speedX = player.speed;
            } else if (event.getCode() == KeyCode.SPACE) {
                 player.jump();
            }
        });
        scene.setOnKeyReleased(event -> {
            if (event.getCode() == KeyCode.LEFT || event.getCode() == KeyCode.RIGHT) {
                player.speedX = 0;
            }
        });

        startGame();

        primaryStage.setTitle("Simple Runner Game");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public void startGame() {
        isRunning = true;
        createObstacles(10);
         createCoins(10);
         updateGame();
    }
    public void stopGame() {
       isRunning = false;
    }

    public void updateGame() {
        new AnimationTimer() {
            @Override
            public void handle(long now) {
                if (isRunning) {
                    player.update();
                    background.update();

                    // تحديث العقبات
                    for (Obstacle obstacle : obstacles) {
                        obstacle.update();
                       if (player.checkCollision(obstacle)) {
                           stopGame();
                           break;
                         }
                    }
                    //تحديث العملات
                    for (int i = coins.size() -1; i>=0; i-- ) {
                         Coin coin = coins.get(i);
                         coin.update();
                         if(player.checkCollision(coin)){
                             score +=10;
                              updateScoreText();
                            coins.remove(coin);
                            }
                     }
                    //زيادة الصعوبة
                    gameSpeed += 0.001;
                    background.speed = gameSpeed;


                     //توليد عقبات وعملات جديدة
                    if (obstacles.get(obstacles.size() - 1).x < SCREEN_WIDTH/2){
                        createObstacles(5);
                        createCoins(5);
                    }
                    // حذف العقبات والعملات التي خرجت من الشاشة
                    obstacles.removeIf(obstacle -> obstacle.x < -obstacle.image.getWidth());
                    coins.removeIf(coin -> coin.x < -coin.image.getWidth());
                 }
            }
        }.start();
    }

     private void updateScoreText() {
         int scoreDigits = String.valueOf(score).length();
         String fileName = "";
         if (scoreDigits > 3){
             fileName = "999+.png";
         }
         else {
             fileName = score + ".png";
         }
         Image image = new Image(getClass().getResourceAsStream(fileName));
        scoreText.setImage(image);

    }

    // توليد العقبات
    private void createObstacles(int count) {
        for (int i = 0; i < count; i++) {
            double x = SCREEN_WIDTH + (random.nextInt(300) + 150) * i;
            double y = 300;
            obstacles.add(new Obstacle(x, y, "obstacle.png", gameSpeed));
            root.getChildren().add(obstacles.get(obstacles.size() - 1).imageView);
        }
    }

     // توليد العملات
    private void createCoins(int count) {
        for (int i = 0; i < count; i++) {
            double x = SCREEN_WIDTH + (random.nextInt(300) + 150) * i;
            double y = 150 + (random.nextInt(150)- 75);
             coins.add(new Coin(x, y, "coin.png", gameSpeed));
            root.getChildren().add(coins.get(coins.size() - 1).imageView);
        }
    }

    public static void main(String[] args) {
        launch(args);
    }

    // فئة اللاعب
    class Player {
        double x, y;
        double speed;
        double speedX = 0;
         double speedY = 0;
        ImageView imageView;
         private final double jumpHeight = -10;
         private boolean isJumping = false;
        public Player(double x, double y, String imagePath, double speed) {
            this.x = x;
            this.y = y;
            this.speed = speed;
             Image image = new Image(getClass().getResourceAsStream(imagePath));
            imageView = new ImageView(image);
            imageView.setX(x);
            imageView.setY(y);
        }

        public void update() {
            x += speedX;
             //القفز
            y += speedY;
            if (y < 250 && isJumping){
                speedY += 1;
             } else {
                speedY = 0;
                 y = 250;
                 isJumping = false;
            }
            // منع اللاعب من الخروج من الشاشة
            if (x < 0) {
                x = 0;
            }
            if (x + imageView.getImage().getWidth() > SCREEN_WIDTH) {
                 x = SCREEN_WIDTH - imageView.getImage().getWidth();
            }
            imageView.setX(x);
            imageView.setY(y);
         }
        public void jump(){
            if(!isJumping) {
                speedY = jumpHeight;
                isJumping = true;
            }
        }

        public boolean checkCollision(Obstacle obstacle) {
            Bounds playerBounds = imageView.getBoundsInParent();
            Bounds obstacleBounds = obstacle.imageView.getBoundsInParent();
            return playerBounds.intersects(obstacleBounds);
        }
         public boolean checkCollision(Coin coin) {
             Bounds playerBounds = imageView.getBoundsInParent();
             Bounds coinBounds = coin.imageView.getBoundsInParent();
             return playerBounds.intersects(coinBounds);
         }
    }

    // فئة الخلفية
    class Background {
        double x, y;
        double speed;
        ImageView imageView;
        Image image;

        public Background(String imagePath, double x, double y, double speed) {
            this.x = x;
            this.y = y;
            this.speed = speed;
             image = new Image(getClass().getResourceAsStream(imagePath));
            imageView = new ImageView(image);
            imageView.setX(x);
            imageView.setY(y);
        }

        public void update() {
            x -= speed;
            if (x < -image.getWidth()) {
                x = 0;
            }
            imageView.setX(x);
        }
    }

    // فئة العقبات
    class Obstacle {
        double x, y;
        double speed;
        ImageView imageView;
        Image image;

        public Obstacle(double x, double y, String imagePath, double speed) {
            this.x = x;
            this.y = y;
            this.speed = speed;
            image = new Image(getClass().getResourceAsStream(imagePath));
            imageView = new ImageView(image);
            imageView.setX(x);
            imageView.setY(y);
        }

        public void update() {
            x -= speed;
            imageView.setX(x);
        }
    }

    // فئة العملات
    class Coin {
         double x, y;
        double speed;
        ImageView imageView;
         Image image;

        public Coin(double x, double y, String imagePath, double speed) {
            this.x = x;
            this.y = y;
            this.speed = speed;
             image = new Image(getClass().getResourceAsStream(imagePath));
            imageView = new ImageView(image);
            imageView.setX(x);
            imageView.setY(y);
         }

        public void update() {
            x -= speed;
            imageView.setX(x);
        }
    }
}